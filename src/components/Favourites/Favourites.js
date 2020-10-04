import { gql } from '@apollo/client/core'
import * as fragments from '../../graphql/fragments'
import StoryList from '../StoryList/StoryList'

const Favourites = () => {
  return (
    <>
      <h1>Your Favourites</h1>
      <StoryList query={Favourites.query} />
    </>
  )
}

Favourites.query = gql`
  query LikedStories($search: String, $offset: Int) {
    likedStories(search: $search, offset: $offset) {
      count
      stories {
        id
        permalink
        title
        keySentences {
          ...SentenceFragment
        }
      }
    }
  }
  ${fragments.sentence}
`

export default Favourites
