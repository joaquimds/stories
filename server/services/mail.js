import nodemailer from 'nodemailer'
import config from '../../config'
import { logger } from './logger'

const {
  email: { host, user, pass },
  site,
} = config

export const transporter = nodemailer.createTransport({
  pool: true,
  host,
  port: 465,
  secure: true,
  auth: {
    user,
    pass,
  },
})

export const sendPasswordReset = (to, token) =>
  new Promise((resolve, reject) => {
    const resetUrl = `${site.url}/reset#${token}`
    const text = `Go to ${resetUrl} to reset your password`
    const html = `Click here to reset your password: <a href="${resetUrl}">${resetUrl}</a>`
    const mailOptions = {
      from: `"Story Tree" ${user}`,
      to,
      subject: 'Password reset',
      text,
      html,
    }
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return reject(err)
      }
      logger.info(`Sent reset password email to ${info.envelope.to[0]}`)
      resolve()
    })
  })

export const sendReport = (sentence) =>
  new Promise((resolve, reject) => {
    const sentenceUrl = `${site.url}/${sentence.id}`
    const text = sentenceUrl
    const html = `<a href="${sentenceUrl}">${sentenceUrl}</a>`
    const mailOptions = {
      from: `"Story Tree" ${user}`,
      to: config.constants.adminEmail,
      subject: `Sentence Reported: ${sentence.id}`,
      text,
      html,
    }
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return reject(err)
      }
      logger.info(`Sent reset password email to ${info.envelope.to[0]}`)
      resolve()
    })
  })

export const sendNotifications = (to, notifications) =>
  new Promise((resolve, reject) => {
    let text = ''
    let html = ''
    const byAuthor = notifications.reduce((obj, notification) => {
      const list = obj[notification.data.authorName] || []
      list.push(notification)
      obj[notification.data.authorName] = list
      return obj
    }, {})
    for (const authorName of Object.keys(byAuthor)) {
      const list = byAuthor[authorName]
      const urls = list.map(
        (notification) => `${site.url}/${notification.data.storyId}`
      )
      const links = urls.map((url) => `<a href="${url}">here</a>`)
      text += `Read what ${authorName} wrote at ${prettyJoin(urls)}\r\n\r\n`
      html += `Read what ${authorName} wrote ${prettyJoin(links)}.<br><br>`
    }
    text += 'You can turn off these emails on your account page.'
    html += `You can turn off these emails on your <a href="${site.url}/account">account page</a>.`
    const mailOptions = {
      from: `"Story Tree" ${user}`,
      to,
      subject: `Your story was added to!`,
      text,
      html,
    }
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return reject(err)
      }
      logger.info(`Sent notification email to ${info.envelope.to[0]}`)
      resolve()
    })
  })

const prettyJoin = (list = []) => {
  if (!list.length) {
    return ''
  }
  if (list.length === 1) {
    return list[0]
  }
  const last = list.pop()
  return `${list.join(', ')} and ${last}`
}
