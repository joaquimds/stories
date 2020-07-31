import { Model, raw } from 'objection'

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
}
