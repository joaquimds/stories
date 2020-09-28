import { Model } from 'objection'

export class Title extends Model {
  static get tableName() {
    return 'titles'
  }
}
