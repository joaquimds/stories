import next from 'next'
import config from '../../config'
import nextConfig from '../../next.config.js'

let nextApp

const getNextApp = () => {
  if (!nextApp) {
    nextApp = next({
      dev: config.dev,
      conf: nextConfig,
    })
  }
  return nextApp
}

export const prepare = () => getNextApp().prepare()

export const getRequestHandler = () => {
  return getNextApp().getRequestHandler()
}
