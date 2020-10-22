import { createEditableLoader } from './editableLoader'
import { createHasChildLoader } from './hasChildLoader'
import { createHasParentLoader } from './hasParentLoader'
import { createTitleLoader } from './titleLoader'
import { createUserLoader } from './userLoader'

export const createDataLoaders = () => {
  return {
    userLoader: createUserLoader(),
    titleLoader: createTitleLoader(),
    hasChildLoader: createHasChildLoader(),
    hasParentLoader: createHasParentLoader(),
    editableLoader: createEditableLoader(),
  }
}
