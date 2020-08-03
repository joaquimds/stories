import config from '../../config'
import { hash } from '../services/bcrypt'

exports.seed = async (knex) => {
  await knex('users').truncate()
  const passwordHash = await hash(config.constants.initialAdminPassword)
  await knex('users').insert([
    { name: 'Admin', email: 'joaquimds@gmail.com', passwordHash },
  ])
}
