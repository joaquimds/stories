import express from 'express'
import { User } from './models/User'
import { hash } from './services/bcrypt'
import { logger } from './services/logger'
import { getRequestHandler } from './services/next'
import { passport } from './services/passport'

export const createRouter = () => {
  const router = express.Router()

  router.put('/api/register', async (req, res) => {
    const name = req.body.name.trim()
    const email = req.body.email.trim()
    const password = req.body.password
    if (!email || !name || !password) {
      return res.sendStatus(400)
    }
    const existingUser = await User.query().where({ email }).first()
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
  })

  router.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.sendStatus(200)
  })

  router.post('/api/logout', (req, res) => {
    req.logout()
    res.sendStatus(200)
  })

  const handler = getRequestHandler()

  router.use(async (req, res, next) => {
    try {
      await handler(req, res)
    } catch (e) {
      next(e)
    }
  })

  // eslint-disable-next-line no-unused-vars
  router.use((err, req, res, next) => {
    logger.error(err.message)
    res.status(500).send('Internal Server Error')
  })

  return router
}
