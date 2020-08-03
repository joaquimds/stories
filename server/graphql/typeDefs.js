import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  enum Order {
    oldest
    newest
    longest
  }
  type User {
    id: String!
    name: String!
  }
  type Sentence {
    id: String!
    content: String!
    parents: [Sentence]!
    childCount: Int!
    children(order: Order, offset: Int): [Sentence]!
    author: User
  }
  type Query {
    sentence(id: String): Sentence
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
