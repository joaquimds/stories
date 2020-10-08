import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  enum Order {
    oldest
    newest
    score
  }
  enum Direction {
    parents
    children
    siblings
  }
  type User {
    id: String!
    name: String!
  }
  type Sentence {
    id: String!
    content: String!
    author: User
    hasParent: Boolean
    hasChild: Boolean
  }
  type Story {
    id: String!
    parent: Sentence
    keySentences(limit: Int): [Sentence]!
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
    otherSentences(
      from: String!
      direction: Direction
      search: String
      offset: Int
    ): SentenceList!
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
  type LinkStoryResponse {
    errorCode: Int
    newStory: Story
    id: String
  }
  type EditStoryResponse {
    errorCode: Int
    newStory: Story
    storyParentId: String
    completeStoryId: String
  }
  type SentenceResponse {
    errorCode: Int
    sentence: Sentence
  }
  type Mutation {
    addSentenceMutation(content: String!, parentId: String!): StoryResponse
    linkSentenceMutation(parentId: String!, childId: String!): LinkStoryResponse
    saveStoryMutation(id: String!, title: String!): SaveResponse
    deleteSentenceMutation(id: String!): SentenceResponse
    unlinkSentenceMutation(id: String!): Response
    likeStoryMutation(id: String!, like: Boolean!): Response
    editStoryMutation(
      id: String!
      editedId: String!
      content: String!
    ): EditStoryResponse
  }
`
