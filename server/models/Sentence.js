import { Model } from 'objection'

export class Sentence extends Model {
  static get tableName() {
    return 'sentences'
  }
}
