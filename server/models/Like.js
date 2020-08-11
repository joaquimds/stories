import { Model } from 'objection'
import { Sentence } from './Sentence'

export class Like extends Model {
  static get tableName() {
    return 'likes'
  }
  static get relationMappings() {
    return {
      sentence: {
        relation: Model.HasOneRelation,
        modelClass: Sentence,
        join: {
          from: 'likes.sentenceId',
          to: 'sentences.id',
        },
      },
      user: {
        relation: Model.HasOneRelation,
        modelClass: Sentence,
        join: {
          from: 'likes.userId',
          to: 'users.id',
        },
      },
    }
  }
}
