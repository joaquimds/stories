import { gql } from '@apollo/client'
import * as fragments from '../../graphql/fragments'
import StoryList from '../StoryList/StoryList'

const Library = () => {
  return <StoryList query={Library.query} />
}

Library.query = gql`
  query Stories($search: String, $order: Order, $offset: Int) {
    stories(search: $search, order: $order, offset: $offset) {
      count
      stories {
        id
        permalink
        title
        keySentences(limit: 1) {
          ...SentenceFragment
        }
      }
    }
  }
  ${fragments.sentence}
`

export default Library
