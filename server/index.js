import { Model } from 'objection'
import { knex } from './services/knex'

Model.knex(knex)

export { app } from './app'
export { runCommand } from './console'
export { knex } from './services/knex'
export { logger } from './services/logger'
export { client } from './services/redis'
export { transporter } from './services/mail'
