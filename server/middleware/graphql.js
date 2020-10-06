import { getDataFromTree } from '@apollo/react-ssr'
import { ApolloServer } from 'apollo-server-express'
import { createDataLoaders } from '../dataloader'
import { schema } from '../graphql/schema'

const server = new ApolloServer({
  schema,
  context: ({ req }) => req,
})

export const applyMiddleware = (app) => {
  app.use((req, res, next) => {
    req.schema = schema
    req.getDataFromTree = getDataFromTree
    req.dataLoaders = createDataLoaders()
    next()
  })
  server.applyMiddleware({ app, path: '/api/graphql' })
}
