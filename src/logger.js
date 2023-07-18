import winston from 'winston'

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
})

const log = (msg, level = 99) => {
  switch (level) {
    case 0:
      logger.error(msg)
      break
    case 1:
      logger.warn(msg)
      break
    default:
      logger.info(msg)
      break
  }
}

export default log
