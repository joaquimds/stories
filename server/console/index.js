import { logger } from '../services/logger'
import { createUser } from './createUser'

const commands = {
  createUser,
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
