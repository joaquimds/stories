import pp from 'passport'
import LocalStrategy from 'passport-local'
import { User } from '../models/User'
import { verify } from '../services/bcrypt'

pp.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await User.query().findOne({ email })
        if (!user) {
          return done(null, false, { message: 'Incorrect email' })
        }
        const isValid = await verify(password, user.passwordHash)

        if (!isValid) {
          return done(null, false, { message: 'Incorrect password' })
        }
        return done(null, user)
      } catch (e) {
        return done(e)
      }
    }
  )
)

pp.serializeUser((user, done) => {
  done(null, user.id)
})

pp.deserializeUser(async (id, done) => {
  try {
    const user = await User.query().findOne({ id })
    done(null, user || null)
  } catch (e) {
    done(e)
  }
})

export const passport = pp
