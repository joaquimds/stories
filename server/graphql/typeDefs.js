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
    id: String
    content: String!
    parents: [Sentence]!
    childCount: Int!
    children(order: Order, offset: Int, exclude: [String]): [Sentence]!
    author: User
    title: String
    slug: String
  }
  type SentenceList {
    count: Int!
    sentences: [Sentence]
  }
  type Query {
    sentence(slug: String): Sentence
    stories(search: String): [Sentence]!
    mySentences(search: String, offset: Int, exclude: [String]): SentenceList!
  }
  type SaveResponse {
    errorCode: Int
    slug: String
  }
  type SentenceResponse {
    errorCode: Int
    sentence: Sentence
  }
  type Mutation {
    addSentenceMutation(content: String!, parentId: String): SentenceResponse
    saveSentenceMutation(id: String!, title: String!): SaveResponse
    deleteSentenceMutation(id: String!): SentenceResponse
  }
`
