import { Model } from 'objection'
import { User } from './User'

export class Notification extends Model {
  static get tableName() {
    return 'notifications'
  }

  static async createNotifications(userIds, data) {
    const users = await User.query().findByIds(userIds)
    return Notification.query().insert(
      users.map((u) => ({
        userId: u.id,
        data,
      }))
    )
  }
}
