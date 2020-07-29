import express from 'express'
import { logger } from './services/logger'
import { getRequestHandler } from './services/next'
import { passport } from './services/passport'

export const createRouter = () => {
  const router = express.Router()

  router.post('/api/login', passport.authenticate('local'), (req, res) => {
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
