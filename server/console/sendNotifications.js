import { Notification } from '../models/Notification'
import { sendNotifications } from '../services/mail'

export const sendAllNotifications = async () => {
  const notifications = await Notification.query()
    .select('users.email', 'users.isNotifiable', 'notifications.*')
    .join('users', 'users.id', 'notifications.userId')
    .orderBy('notifications.id', 'asc')
  const byUser = notifications.reduce((obj, notification) => {
    if (notification.isNotifiable) {
      const list = obj[notification.email] || []
      list.push(notification)
      obj[notification.email] = list
    }
    return obj
  }, {})
  for (const email of Object.keys(byUser)) {
    const notifications = byUser[email]
    await sendNotifications(email, notifications)
  }
  return Notification.query()
    .delete()
    .whereIn(
      'id',
      notifications.map((n) => n.id)
    )
}
