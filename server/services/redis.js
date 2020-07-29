import redis from 'redis'
import config from '../../config'

export const client = redis.createClient({ url: config.redis.uri })
