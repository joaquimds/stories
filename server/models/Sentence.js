import { Model, ref, raw } from 'objection'
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
      .select('*')
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
    const counts = {}
    const backtrace = [...thread.backtrace]
    while (childId) {
      counts[childId] = counts[childId] ? counts[childId] + 1 : 1
      const backlink = backtrace[0]
      let parent
      if (backlink) {
        const { from, count, to } = backlink
        if (from === childId && count === counts[childId]) {
          parent = allParents.find(({ id }) => id === to)
          backtrace.shift()
        }
      }
      if (!parent) {
        parent = allParents.find(({ to }) => to === childId)
      }
      if (parent) {
        const thread = {
          end: parent.id,
          backtrace: [...backtrace],
        }
        parents.push({ ending: parent, thread, id: printThread(thread) })
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
    return query.limit(limit).debug()
  }

  async createPoints(thread, params) {
    const parents = await this.getParents(thread)
    const ids = {}
    for (const parent of parents) {
      ids[parent.id] = true
    }
    ids[this.id] = true
    delete ids['0']
    const type = params.likeId ? 'LIKE' : 'WRITE'
    for (const sentenceId of Object.keys(ids)) {
      const item = { sentenceId, type, ...params }
      const point = await Point.query().findOne({
        sentenceId,
        userId: params.userId,
        type,
      })
      if (!point) {
        await Point.query().insert(item)
      }
    }
  }

  getCreatedThread() {
    const thread = parseThread(this.storyParentId)
    thread.end = this.id
    return thread
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
          Sentence.query()
            .count()
            .from(raw('sentences s1'))
            .as('match')
            .whereRaw('s1.id = sentences.id')
            .andWhereRaw('s1.story_parent_id = ?', storyId)
        )
        subqueries.push(
          Point.query()
            .count()
            .as('score')
            .where({ sentenceId: ref('sentences.id') })
        )
        query.select(subqueries)
        query.orderBy('match', 'desc')
        query.orderBy('score', 'desc')
        query.orderBy('id', 'asc')
        break
    }
    return query
  }
}
