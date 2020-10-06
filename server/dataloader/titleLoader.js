import DataLoader from 'dataloader'
import { Title } from '../models/Title'

export const createTitleLoader = () =>
  new DataLoader(async (storyIds) => {
    const titles = await Title.query().whereIn('storyId', storyIds)
    return storyIds.map((id) => titles.find(({ storyId }) => storyId === id))
  })
