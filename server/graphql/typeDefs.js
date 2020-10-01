import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  enum Order {
    oldest
    newest
    score
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
    parent: Story
    parents: [Story]!
    ending: Sentence!
    childCount: Int!
    children(order: Order, exclude: [String]): [Story]!
    title: String
    permalink: String!
    liked: Boolean!
    linkAuthor: User
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
    stories(search: String, order: Order, offset: Int): StoryList!
    myStories(search: String, offset: Int): StoryList!
    myLinks(search: String, offset: Int): StoryList!
    likedStories(search: String, offset: Int): StoryList!
    otherSentences(from: String!, search: String, offset: Int): SentenceList!
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
    linkSentenceMutation(parentId: String!, childId: String!): StoryResponse
    saveStoryMutation(id: String!, title: String!): SaveResponse
    deleteSentenceMutation(id: String!): SentenceResponse
    unlinkSentenceMutation(id: String!): Response
    likeStoryMutation(id: String!, like: Boolean!): Response
  }
`
