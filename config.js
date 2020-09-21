require('dotenv').config({
  path: process.env.DOTENV_EXT ? `.env.${process.env.DOTENV_EXT}` : '.env',
})

module.exports = {
  constants: {
    adminEmail: process.env.ADMIN_EMAIL,
    initialAdminPassword: process.env.INITIAL_ADMIN_PASSWORD,
    pageSize: Number(process.env.PAGE_SIZE) || 10,
  },
  db: {
    uri: process.env.PG_URI,
  },
  dev: process.env.NODE_ENV === 'development',
  email: {
    host: 'mail.gandi.net',
    user: 'stories@joaquimdsouza.com',
    pass: process.env.SMTP_PASSWORD,
  },
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
  site: {
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    url: process.env.SITE_URL || 'https://treeoftales.net',
  },
}
