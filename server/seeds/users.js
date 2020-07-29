import config from '../../config'
import { hash } from '../services/bcrypt'

exports.seed = async (knex) => {
  await knex('users').del()
  const passwordHash = await hash(config.constants.initialAdminPassword)
  await knex('users').insert([{ username: 'admin', passwordHash }])
}
