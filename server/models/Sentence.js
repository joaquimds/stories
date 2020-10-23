import { Model, ref, raw } from 'objection'
import config from '../../config'
import { parseThread, printThread } from '../util/threads'
import { Point } from './Point'
import { SentenceLink } from './SentenceLink'

export class Sentence extends Model {
  static get tableName() {
    return 'sentences'
  }

  static relationMappings = {
    parents: {
      relation: Model.ManyToManyRelation,
      modelClass: Sentence,
      join: {
        from: 'sentences.id',
        through: {
          from: 'sentenceLinks.to',
          to: 'sentenceLinks.from',
        },
        to: 'sentences.id',
      },
    },
    children: {
      relation: Model.ManyToManyRelation,
      modelClass: Sentence,
      join: {
        from: 'sentences.id',
        through: {
          from: 'sentenceLinks.from',
          to: 'sentenceLinks.to',
        },
        to: 'sentences.id',
      },
    },
  }

  async getParent(thread) {
    const query = Sentence.query()
      .select('sentences.*')
      .join('sentenceLinks', 'sentences.id', 'sentenceLinks.from')
      .where('sentenceLinks.to', '=', this.id)
    const backtrace = [...thread.backtrace]
    const backlink = backtrace[0]
    let parent
    if (backlink && backlink.from === this.id) {
      parent = await query
        .clone()
        .andWhere('sentenceLinks.from', '=', backlink.to)
        .first()
      backtrace.shift()
    }
    if (!parent) {
      parent = await query
        .orderBy(ref('sentenceLinks.id'), 'asc')
        .limit(1)
        .first()
    }
    return parent
  }

  async getParents(thread) {
    const allParents = await Sentence.query()
      .select('sentences.*', 'parents.from', 'parents.to')
      .from('parents')
      .join('sentences', 'parents.from', 'sentences.id')
      .withRecursive('parents', (qb1) => {
        qb1
          .select('sentence_links.*')
          .from('sentence_links')
          .where('sentence_links.to', '=', this.id)
          .union((qb2) => {
            qb2
              .select('sentence_links.*')
              .from('sentence_links')
              .join('parents', 'sentence_links.to', 'parents.from')
          })
      })
      .orderBy('parents.id', 'asc')
    let childId = this.id
    const parents = []
    let backtrace = [...thread.backtrace]
    while (childId) {
      const backlink = backtrace[0]
      let parent
      if (backlink) {
        const { from, to } = backlink
        if (from === childId) {
          parent = allParents.find(({ id }) => id === to)
          backtrace.shift()
        }
      }
      if (!parent) {
        parent = allParents.find(({ to }) => to === childId)
      }
      if (parent) {
        const parentThread = { end: parent.id, backtrace: [...backtrace] }
        parents.push({
          ending: parent,
          thread: parentThread,
          id: printThread(parentThread),
        })
      }
      childId = parent?.id
    }
    return parents.reverse()
  }

  async countChildren() {
    const countQuery = await Sentence.query()
      .join('sentenceLinks', 'sentenceLinks.to', 'sentences.id')
      .where('sentenceLinks.from', '=', this.id)
      .andWhereRaw('sentences.author_id is not null')
      .count()
      .first()
    return Number(countQuery.count)
  }

  async getChildren(
    storyId,
    order = 'score',
    exclude = [],
    limit = config.constants.pageSize
  ) {
    const subquery = SentenceLink.query()
      .select('from')
      .where({ to: ref('sentences.id') })
      .orderBy('id', 'asc')
      .limit(1)
      .as('defaultParent')
    const query = Sentence.query()
      .select(['sentences.*', subquery])
      .join('sentenceLinks', 'sentenceLinks.to', 'sentences.id')
      .whereNotIn('sentences.id', exclude)
      .andWhere('sentenceLinks.from', '=', this.id)
      .andWhereRaw('sentences.author_id is not null')
    Sentence.addOrder(query, storyId, order)
    return query.limit(limit)
  }

  async createPointsReturningAuthorIds(thread, userId, type) {
    const parents = await this.getParents(thread)
    const authorIds = []
    let sentenceId = this.id
    const chunks = []
    let points = []
    while (parents.length) {
      const parent = parents.pop()
      authorIds.push(parent.ending.authorId)
      const storyParentId = parent.id
      points.push([sentenceId, storyParentId, userId, type])
      if (points.length === 100) {
        chunks.push(points)
        points = []
      }
      sentenceId = parent.ending.id
    }
    if (points.length) {
      chunks.push(points)
    }
    for (const chunk of chunks) {
      const args = chunk.reduce((arr, point) => arr.concat(point), [])
      const placeholder = Array.from({ length: chunk.length })
        .map(() => '(?,?,?,?)')
        .join(', ')
      await Point.knex().raw(
        `INSERT INTO points (sentence_id, story_parent_id, user_id, type) 
        VALUES ${placeholder}
        ON CONFLICT (sentence_id, story_parent_id, user_id, type) DO UPDATE SET count = points.count + 1`,
        args
      )
    }
    return authorIds
  }

  async removePoints(thread, type, userIds) {
    const parents = await this.getParents(thread)
    let sentenceId = this.id
    while (parents.length) {
      const parent = parents.pop()
      const storyParentId = parent.id
      await Point.query()
        .patch({ count: raw('greatest(0, count - 1)') })
        .whereIn('userId', userIds)
        .andWhere({ type, sentenceId, storyParentId })
      sentenceId = parent.ending.id
    }
  }

  getCreatedThread() {
    const thread = parseThread(this.storyParentId)
    thread.end = this.id
    return thread
  }

  static async areEditable(ids) {
    const scores = await Sentence.query()
      .select('sentenceId', raw('count(1) as value'))
      .joinRaw(
        'inner join points on points.sentence_id = sentences.id and points.user_id != sentences.author_id'
      )
      .whereIn('sentences.id', ids)
      .andWhere('points.count', '>', 0)
      .groupBy('sentenceId')
    return ids.map((id) => {
      const score = scores.find((s) => s.sentenceId === id)
      return !score || score.value === 0
    })
  }

  static async isEditable(id) {
    const result = await Sentence.areEditable([id])
    return result[0]
  }

  static addOrder(query, storyId, order = 'oldest') {
    const subqueries = []
    switch (order) {
      case 'newest':
        query.orderBy('id', 'desc')
        break
      case 'oldest':
        query.orderBy('id', 'asc')
        break
      case 'score':
      default:
        subqueries.push(
          Point.query()
            .count()
            .as('matchingScore')
            .where({ sentenceId: ref('sentences.id'), storyParentId: storyId })
            .andWhere('count', '>', 0)
        )
        subqueries.push(
          Point.query()
            .countDistinct('userId')
            .as('score')
            .where({ sentenceId: ref('sentences.id') })
            .andWhere('count', '>', 0)
        )
        query.select(subqueries)
        query.orderBy('matchingScore', 'desc')
        query.orderBy('score', 'desc')
        query.orderBy('id', 'asc')
        break
    }
    return query
  }
}
