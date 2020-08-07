import express from 'express'
import { api } from './routes/api'
import { logger } from './services/logger'
import { getRequestHandler } from './services/next'

export const createRouter = () => {
  const router = express.Router()

  router.use(api)

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
