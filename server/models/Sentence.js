import { Model, raw, ref } from 'objection'

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
              .join('parents', 'sentences.id', 'parents.parent_id')
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
    exclude = []
  ) {
    const limit = 3
    if (order !== 'longest') {
      const direction = order === 'newest' ? 'desc' : 'asc'
      return Sentence.query()
        .whereNotIn('id', exclude)
        .andWhere({ parentId })
        .orderBy('id', direction)
        .offset(offset)
        .limit(limit)
    }
    const subquery = Sentence.query()
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
                'sentences.parent_id',
                'sentenceDepths.id'
              )
          })
      })
    return Sentence.query()
      .select(['sentences.*', subquery])
      .whereNotIn('id', exclude)
      .andWhere({ parentId })
      .orderBy('length', 'desc')
      .orderBy('id', 'asc')
      .offset(offset)
      .limit(limit)
  }
}
