import DataLoader from 'dataloader'
import { Sentence } from '../models/Sentence'

export const createEditableLoader = () =>
  new DataLoader(async (ids) => {
    return Sentence.areEditable(ids)
  })
