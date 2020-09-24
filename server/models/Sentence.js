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
      .withRecursive('parents', (qb1) => {
        qb1
          .select('sentences.*', 'sentence_links.from', raw('1 as depth'))
          .from('sentences')
          .join('sentence_links', 'sentence_links.from', 'sentences.id')
          .where('sentence_links.to', '=', this.id)
          .union((qb2) => {
            qb2
              .select('sentences.*', 'sentence_links.from', raw('depth + 1'))
              .from('sentences')
              .join('sentence_links', 'sentence_links.from', 'sentences.id')
              .join('parents', 'sentence_links.to', 'parents.from')
          })
      })
      .orderBy('depth', 'desc')
      .orderBy('id', 'asc')
    const byDepth = {}
    for (const parent of allParents) {
      if (!byDepth[parent.depth]) {
        byDepth[parent.depth] = []
      }
      byDepth[parent.depth].push(parent)
    }
    let child = { id: this.id, depth: 0 }
    const parents = []
    const counts = {}
    while (child) {
      const { id: childId, depth: childDepth } = child
      counts[childId] = counts[childId] ? counts[childId] + 1 : 1
      const currentPathInfo = pathInfo.find(
        ({ from, count }) =>
          childId === from && Number(count) === counts[childId]
      )
      let parent
      if (currentPathInfo) {
        parent = allParents.find(({ id }) => id === currentPathInfo.to)
      }
      if (!parent) {
        const parentsForDepth = byDepth[childDepth + 1]
        parent = parentsForDepth ? parentsForDepth[0] : null
      }
      if (parent) {
        parents.push(parent)
      }
      child = parent
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
      .where({ to: ref('sentences.id') })
      .count()
      .as('parentCount')
    const query = Sentence.query()
      .select(['sentences.*', subquery])
      .join('sentenceLinks', 'sentenceLinks.to', 'sentences.id')
      .whereNotIn('sentences.id', exclude)
      .andWhere('sentenceLinks.from', '=', this.id)
    Sentence.addOrder(query, order)
    return query.limit(limit)
  }

  static addOrder(query, order = 'oldest') {
    const select = ['sentences.*']
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
        select.push(subquery)
        break
    }
    return query.select(select)
  }
}
