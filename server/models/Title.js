import { Model } from 'objection'
import { Sentence } from './Sentence'

export class Title extends Model {
  static get tableName() {
    return 'titles'
  }

  static relationMappings = {
    sentence: {
      relation: Model.BelongsToOneRelation,
      modelClass: Sentence,
      join: {
        from: 'titles.sentenceId',
        to: 'sentences.id',
      },
    },
  }
}
