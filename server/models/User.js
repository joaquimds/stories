import { Model } from 'objection'
import { Sentence } from './Sentence'

export class User extends Model {
  static get tableName() {
    return 'users'
  }

  static relationMappings = {
    sentences: {
      relation: Model.HasManyRelation,
      modelClass: Sentence,
      join: {
        from: 'users.id',
        to: 'sentences.authorId',
      },
    },
  }
}
