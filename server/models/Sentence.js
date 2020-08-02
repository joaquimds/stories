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
    const countQuery = await Sentence.query().where({ parentId }).count()
    return Number(countQuery[0].count)
  }

  static async getChildren(parentId, order = 'longest', offset = 0) {
    const limit = 5
    if (order !== 'longest') {
      return Sentence.query()
        .where({ parentId })
        .orderBy('date', order === 'newest' ? 'desc' : 'asc')
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
      .where({ parentId })
      .orderBy('length', 'desc')
      .offset(offset)
      .limit(limit)
  }
}
