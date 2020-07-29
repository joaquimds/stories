import { makeExecutableSchema } from 'apollo-server-express'

import { resolvers } from './resolvers'
import { typeDefs } from './typeDefs'

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
