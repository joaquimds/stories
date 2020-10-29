import connectRedis from 'connect-redis'
import session from 'express-session'
import config from '../../config'
import { passport } from '../services/passport'
import { client } from '../services/redis'

const RedisStore = connectRedis(session)

const ONE_WEEK_MILLIS = 7 * 24 * 60 * 60 * 1000

export const applyMiddleware = (app) => {
  if (config.session.secure) {
    app.set('trust proxy', 1)
  }
  app.use(
    session({
      cookie: {
        maxAge: ONE_WEEK_MILLIS,
        secure: config.session.secure,
      },
      secret: config.session.secret,
      store: new RedisStore({ client }),
      resave: false,
      saveUninitialized: false,
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())
}
