import { constants } from '../../config'
import { Sentence } from '../models/Sentence'
import { User } from '../models/User'
import { hash } from '../services/bcrypt'

export const createMinimalFixtures = async () => {
  await Sentence.query().insert({
    id: 0,
    content: '',
    storyParentId: 0,
  })
  const passwordHash = await hash(constants.initialAdminPassword)
  await User.query().insert({
    email: constants.adminEmail,
    name: 'Admin',
    passwordHash,
  })
}
