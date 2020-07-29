require('dotenv').config()

module.exports = {
  constants: {
    initialAdminPassword: process.env.INITIAL_ADMIN_PASSWORD,
  },
  db: {
    uri: process.env.PG_URI,
  },
  dev: process.env.NODE_ENV === 'development',
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  redis: {
    uri: process.env.REDIS_URI,
  },
  server: {
    port: process.env.PORT || 3000,
  },
  session: {
    secret: process.env.SESSION_SECRET,
    secure: process.env.SESSION_SECURE !== 'false',
  },
}
