import { User } from '../models/User'
import { hash } from '../services/bcrypt'

export const createUser = async (username, password) => {
  const passwordHash = await hash(password)
  await User.query().insert({
    username,
    passwordHash,
  })
}
