import DataLoader from 'dataloader'
import { SentenceLink } from '../models/SentenceLink'

export const createHasParentLoader = () =>
  new DataLoader(async (sentenceIds) => {
    const links = await SentenceLink.query()
      .whereIn('to', sentenceIds)
      .andWhere('from', '!=', '0')
    return sentenceIds.map((id) => Boolean(links.find(({ to }) => to === id)))
  })
