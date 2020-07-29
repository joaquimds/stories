require('@babel/register')

const path = require('path')
const { knexSnakeCaseMappers } = require('objection')
const config = require('./config')

module.exports = {
  client: 'pg',
  connection: config.db.uri,
  migrations: {
    directory: path.join(__dirname, 'server', 'migrations'),
  },
  seeds: {
    directory: path.join(__dirname, 'server', 'seeds'),
  },
  ...knexSnakeCaseMappers(),
}
