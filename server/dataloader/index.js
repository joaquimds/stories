import { createTitleLoader } from './titleLoader'
import { createUserLoader } from './userLoader'

export const createDataLoaders = () => {
  return {
    userLoader: createUserLoader(),
    titleLoader: createTitleLoader(),
  }
}
