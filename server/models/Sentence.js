import { Model, raw, ref } from 'objection'
import { parsePath } from '../util/paths'
import { Like } from './Like'
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
        from: 'sentenceLinks.from',
        to: 'sentenceLinks.to',
      },
    },
  }

  async getParents(path = '') {
    const pathInfo = parsePath(path)
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
    while (childId) {
      counts[childId] = counts[childId] ? counts[childId] + 1 : 1
      const currentPathInfo = pathInfo.find(
        ({ from, count }) => childId === from && count === counts[childId]
      )
      let parent
      if (currentPathInfo) {
        parent = allParents.find(({ id }) => id === currentPathInfo.to)
      }
      if (!parent) {
        parent = allParents.find(({ to }) => to === childId)
      }
      if (parent) {
        parents.push(parent)
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

  async getChildren(order = 'likes', exclude = [], limit = 3) {
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
    Sentence.addOrder(query, order)
    return query.limit(limit).debug()
  }

  static addOrder(query, order = 'oldest') {
    let subquery
    switch (order) {
      case 'newest':
        query.orderBy('id', 'desc')
        break
      case 'oldest':
        query.orderBy('id', 'asc')
        break
      case 'likes':
      default:
        subquery = Like.query()
          .where({ sentenceId: ref('sentences.id') })
          .count()
          .as('likes')
        query.orderBy('likes', 'desc')
        query.orderBy('id', 'asc')
        query.select(subquery)
        break
    }
    return query
  }
}
