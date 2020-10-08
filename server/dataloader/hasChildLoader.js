import DataLoader from 'dataloader'
import { SentenceLink } from '../models/SentenceLink'

export const createHasChildLoader = () =>
  new DataLoader(async (sentenceIds) => {
    const links = await SentenceLink.query().whereIn('from', sentenceIds)
    return sentenceIds.map((id) =>
      Boolean(links.find(({ from }) => from === id))
    )
  })
