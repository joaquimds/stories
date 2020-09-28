import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  enum Order {
    oldest
    newest
    likes
  }
  type User {
    id: String!
    name: String!
  }
  type Sentence {
    id: String!
    content: String!
    author: User
  }
  type Story {
    id: String!
    intro: String!
    parents: [Story]!
    ending: Sentence!
    childCount: Int!
    children(order: Order, exclude: [String]): [Story]!
    title: String
    liked: Boolean!
  }
  type StoryList {
    count: Int!
    stories: [Story]!
  }
  type SentenceList {
    count: Int!
    sentences: [Sentence]!
  }
  type Query {
    story(slug: String!): Story
    stories(search: String, offset: Int): StoryList!
    mySentences(search: String, offset: Int): SentenceList!
    likedSentences(search: String, offset: Int): SentenceList!
  }
  type Response {
    errorCode: Int
  }
  type SaveResponse {
    errorCode: Int
    slug: String
  }
  type StoryResponse {
    errorCode: Int
    story: Story
  }
  type SentenceResponse {
    errorCode: Int
    sentence: Sentence
  }
  type Mutation {
    addSentenceMutation(content: String!, parentId: String!): StoryResponse
    saveSentenceMutation(id: String!, title: String!): SaveResponse
    deleteSentenceMutation(id: String!): SentenceResponse
    likeSentenceMutation(id: String!, like: Boolean!): Response
  }
`
