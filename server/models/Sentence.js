import { Model, raw, ref } from 'objection'
import { Like } from './Like'

export class Sentence extends Model {
  static get tableName() {
    return 'sentences'
  }

  static relationMappings = {
    parent: {
      relation: Model.BelongsToOneRelation,
      modelClass: Sentence,
      join: {
        from: 'sentences.parentId',
        to: 'sentences.id',
      },
    },
    children: {
      relation: Model.HasManyRelation,
      modelClass: Sentence,
      join: {
        from: 'sentences.id',
        to: 'sentences.parentId',
      },
    },
  }

  getParents() {
    return Sentence.query()
      .select('*')
      .from('parents')
      .withRecursive('parents', (qb1) => {
        qb1
          .select('*', raw('1 as depth'))
          .from('sentences')
          .where({ id: this.parentId })
          .union((qb2) => {
            qb2
              .select('sentences.*', raw('depth + 1'))
              .from('sentences')
              .join('parents', 'sentences.id', 'parents.parentId')
          })
      })
      .orderBy('depth', 'desc')
  }

  static async countChildren(parentId) {
    const countQuery = await Sentence.query().findOne({ parentId }).count()
    return Number(countQuery.count)
  }

  static async getChildren(
    parentId,
    order = 'longest',
    offset = 0,
    limit = 3,
    exclude = []
  ) {
    const query = Sentence.query()
      .whereNotIn('id', exclude)
      .andWhere({ parentId })
    Sentence.addOrder(query, order)
    return query.offset(offset).limit(limit)
  }

  static addOrder(query, order = 'oldest') {
    const select = ['sentences.*']
    let subquery
    switch (order) {
      case 'newest':
        query.orderBy('id', 'desc')
        break
      case 'likes':
        subquery = Like.query()
          .where({ sentenceId: ref('sentences.id') })
          .count()
          .as('likes')
        query.orderBy('likes', 'desc')
        query.orderBy('id', 'asc')
        select.push(subquery)
        break
      case 'longest':
        subquery = Sentence.query()
          .max('depth')
          .as('length')
          .from('sentenceDepths')
          .withRecursive('sentenceDepths', (qb1) => {
            qb1
              .select('id', raw('1 as depth'))
              .from('sentences as s1')
              .where({ id: ref('sentences.id') })
              .union((qb2) => {
                qb2
                  .select('sentences.id', raw('depth + 1'))
                  .from('sentences')
                  .join(
                    'sentenceDepths',
                    'sentences.parentId',
                    'sentenceDepths.id'
                  )
              })
          })
        query.orderBy('length', 'desc')
        query.orderBy('id', 'asc')
        select.push(subquery)
        break
      case 'deepest':
        subquery = Sentence.query()
          .max('depth')
          .as('length')
          .from('sentenceDepths')
          .withRecursive('sentenceDepths', (qb1) => {
            qb1
              .select('parentId', raw('1 as depth'))
              .from('sentences as s1')
              .where({ id: ref('sentences.id') })
              .union((qb2) => {
                qb2
                  .select('sentences.parentId', raw('depth + 1'))
                  .from('sentences')
                  .join(
                    'sentenceDepths',
                    'sentences.id',
                    'sentenceDepths.parentId'
                  )
              })
          })
        query.orderBy('length', 'desc')
        query.orderBy('id', 'asc')
        select.push(subquery)
        break
      case 'oldest':
      default:
        query.orderBy('id', 'asc')
        break
    }
    return query.select(select)
  }
}
