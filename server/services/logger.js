import winston from 'winston'
import config from '../../config'

const { createLogger, format, transports } = winston

const level = config.logger.level

export const logger = createLogger({
  level,
  format: format.combine(
    format.timestamp(),
    format.cli(),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [new transports.Console()],
})
