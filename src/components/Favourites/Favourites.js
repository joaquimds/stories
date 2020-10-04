import { gql } from '@apollo/client/core'
import * as fragments from '../../graphql/fragments'
import AccountSentenceList from '../AccountSentenceList/AccountSentenceList'

const Favourites = () => {
  return (
    <>
      <h1>Your Favourites</h1>
      <AccountSentenceList query={Favourites.query} />
    </>
  )
}

Favourites.query = gql`
  query LikedStories($search: String, $offset: Int) {
    likedStories(search: $search, offset: $offset) {
      count
      stories {
        definedParents {
          ...SentenceFragment
        }
        ...StoryFragment
      }
    }
  }
  ${fragments.story}
`

export default Favourites
