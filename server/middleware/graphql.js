import { getDataFromTree } from '@apollo/react-ssr'
import { ApolloServer } from 'apollo-server-express'
import { schema } from '../graphql/schema'

const server = new ApolloServer({
  schema,
  context: ({ req: { user } }) => ({ user }),
})

export const applyMiddleware = (app) => {
  app.use((req, res, next) => {
    req.schema = schema
    req.getDataFromTree = getDataFromTree
    next()
  })
  server.applyMiddleware({ app, path: '/api/graphql' })
}
