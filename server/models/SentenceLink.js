import { Model } from 'objection'

export class SentenceLink extends Model {
  static get tableName() {
    return 'sentenceLinks'
  }
}
