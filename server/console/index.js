import { logger } from '../services/logger'
import { createFixtures } from './createFixtures'

const commands = {
  createFixtures,
}

export const runCommand = async (name, ...args) => {
  try {
    logger.info('Running ' + name)
    const command = commands[name]
    await command(...args)
    logger.info('Complete')
  } catch (e) {
    logger.error(e.message)
  }
}
