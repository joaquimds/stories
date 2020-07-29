import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  type User {
    id: Int!
    username: String!
  }
  type Sentence {
    id: Int!
    content: String!
    parent: Sentence
    siblings: [Sentence]!
    children: [Sentence]!
    author: User!
  }
  type Query {
    sentence(id: Int!): Sentence
  }
  type Response {
    success: Boolean!
  }
  type Mutation {
    addSentenceMutation(content: String!, parentId: Int): Sentence
    deleteSentenceMutation(id: Int!): Response
  }
`
