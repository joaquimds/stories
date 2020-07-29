#!/usr/bin/env node
require('@babel/register')

const config = require('../config')
const { app, logger } = require('../server')

process.on('unhandledRejection', (err = 'unknown error') => {
  const message = err instanceof Error ? err.message : err
  logger.error(`Unhandled Rejection: ${message}`)
})

const {
  server: { port },
} = config

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`)
})
