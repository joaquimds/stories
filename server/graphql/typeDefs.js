import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  enum Order {
    oldest
    newest
    longest
  }
  type User {
    id: String!
    username: String!
  }
  type Sentence {
    id: String!
    content: String!
    parents: [Sentence]!
    children(order: Order): [Sentence]!
    author: User
  }
  type Query {
    sentence(id: String!): Sentence
    beginnings(order: Order): [Sentence]!
  }
  type DeleteResponse {
    success: Boolean!
    sentence: Sentence
  }
  type Mutation {
    addSentenceMutation(content: String!, parentId: String): Sentence
    deleteSentenceMutation(id: String!): DeleteResponse
  }
`
