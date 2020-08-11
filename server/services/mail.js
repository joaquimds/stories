const nodemailer = require('nodemailer')
const {
  email: { host, user, pass },
  site,
} = require('../../config')
const { logger } = require('./logger')

const transporter = nodemailer.createTransport({
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
