import gql from 'graphql-tag'

export const sentence = gql`
  fragment SentenceFragment on Sentence {
    id
    content
    author {
      id
      name
    }
  }
`

export const story = gql`
  fragment StoryFragment on Story {
    id
    permalink
    ending {
      ...SentenceFragment
    }
  }
  ${sentence}
`
