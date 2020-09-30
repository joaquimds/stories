import { Model, ref } from 'objection'
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
        from: 'sentenceLinks.to',
        to: 'sentenceLinks.from',
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
        const { from, count, to } = backlink
        if (from === childId && count === 1) {
          parent = allParents.find(({ id }) => id === to)
          backtrace.shift()
          backtrace = backtrace.map((p) => {
            const c = p.from === childId ? p.count - 1 : p.count
            return { ...p, count: c }
          })
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
    const countQuery = await SentenceLink.query()
      .findOne({ from: this.id })
      .count()
    return Number(countQuery.count)
  }

  async getChildren(storyId, order = 'score', exclude = [], limit = 3) {
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
    Sentence.addOrder(query, storyId, order)
    return query.limit(limit)
  }

  async createPoints(thread, params) {
    const parents = await this.getParents(thread)
    let sentenceId = this.id
    while (parents.length) {
      const parent = parents.pop()
      const storyParentId = parent.id
      const item = { sentenceId, storyParentId, ...params }
      const point = await Point.query().findOne({
        sentenceId,
        storyParentId,
        userId: params.userId,
        type: params.type,
      })
      if (!point) {
        await Point.query().insert(item)
      }
      sentenceId = parent.ending.id
    }
  }

  getCreatedThread() {
    const thread = parseThread(this.storyParentId)
    thread.end = this.id
    return thread
  }

  static addOrder(query, storyId, order = 'oldest') {
    let subquery
    switch (order) {
      case 'newest':
        query.orderBy('id', 'desc')
        break
      case 'oldest':
        query.orderBy('id', 'asc')
        break
      case 'score':
      default:
        subquery = Point.query()
          .count()
          .as('score')
          .where({ sentenceId: ref('sentences.id'), storyParentId: storyId })
        query.select(subquery)
        query.orderBy('score', 'desc')
        query.orderBy('id', 'asc')
        break
    }
    return query
  }
}
