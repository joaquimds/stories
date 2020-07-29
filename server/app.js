import bodyParser from 'body-parser'
import express from 'express'
import { Model } from 'objection'
import { applyMiddleware as auth } from './middleware/auth'
import { applyMiddleware as graphql } from './middleware/graphql'
import { createRouter } from './router'
import { knex } from './services/knex'
import { prepare } from './services/next'

Model.knex(knex)

export const app = {
  listen: async (port, callback) => {
    const app = express()

    app.use(bodyParser.json())
    auth(app)
    graphql(app)
    app.use(createRouter())

    app.listen(port, callback)

    await prepare()
  },
}
