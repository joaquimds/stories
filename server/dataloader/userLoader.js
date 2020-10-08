import DataLoader from 'dataloader'
import { User } from '../models/User'

export const createUserLoader = () =>
  new DataLoader(async (ids) => {
    const users = await User.query().findByIds(ids)
    return ids.map((id) => users.find((u) => u.id === id))
  })
