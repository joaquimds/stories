import DataLoader from 'dataloader'
import { User } from '../models/User'

export const createUserLoader = () =>
  new DataLoader((ids) => User.query().findByIds(ids))
