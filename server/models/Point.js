import { Model } from 'objection'

export class Point extends Model {
  static get tableName() {
    return 'points'
  }
}
