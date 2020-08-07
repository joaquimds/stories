import { randomBytes } from 'crypto'
import express from 'express'
import { User } from '../models/User'
import { hash } from '../services/bcrypt'
import { logger } from '../services/logger'
import { sendPasswordReset } from '../services/mail'
import { passport } from '../services/passport'

const router = express.Router()

router.put('/api/register', async (req, res) => {
  try {
    const name = getFromBody(req.body, 'name')
    const email = getFromBody(req.body, 'email')
    const password = req.body.password
    if (!email || !name || !password) {
      return res.sendStatus(400)
    }
    const existingUser = await User.query().findOne({ email })
    if (existingUser) {
      return res.sendStatus(409)
    }
    const passwordHash = await hash(password)
    const user = await User.query().insertAndFetch({
      name,
      passwordHash,
      email,
    })
    req.login(user, () => res.sendStatus(200))
  } catch (e) {
    logger.error(e.message)
    res.sendStatus(500)
  }
})

router.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.sendStatus(200)
})

router.post('/api/logout', (req, res) => {
  req.logout()
  res.sendStatus(200)
})

router.post('/api/forgot-password', async (req, res) => {
  try {
    const email = getFromBody(req.body, 'email')
    if (!email) {
      return res.sendStatus(400)
    }
    const resetToken = await genToken()
    const count = await User.query().patch({ resetToken }).findOne({ email })
    if (!count) {
      return res.sendStatus(404)
    }
    await sendPasswordReset(email, resetToken)
    res.sendStatus(200)
  } catch (e) {
    logger.error(e.message)
    res.sendStatus(500)
  }
})

router.post('/api/reset-password', async (req, res) => {
  try {
    const password = req.body.password
    const resetToken = getFromBody(req.body, 'token')
    if (!password || !resetToken) {
      return res.sendStatus(400)
    }
    const tokenTimestamp = Number(resetToken.split('.').pop())
    const tokenExpires = tokenTimestamp + 60 * 60 * 1000
    if (!tokenExpires || tokenExpires < Date.now()) {
      return res.sendStatus(498)
    }
    const passwordHash = await hash(password)
    const count = await User.query()
      .patch({ passwordHash })
      .findOne({ resetToken })
    if (!count) {
      return res.sendStatus(404)
    }
    res.sendStatus(200)
  } catch (e) {
    logger.error(e.message)
    res.sendStatus(500)
  }
})

const getFromBody = (body, key) => {
  return body[key] ? body[key].trim() : null
}

const genToken = () =>
  new Promise((resolve, reject) => {
    randomBytes(32, (err, buffer) => {
      if (err) {
        return reject(err)
      }
      const token = buffer
        .toString('base64')
        .replace(/\//g, '_')
        .replace(/\+/g, '-')
      resolve(`${token}.${Date.now()}`)
    })
  })

export const api = router
