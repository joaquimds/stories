import { gql } from '@apollo/client/core'
import AccountSentenceList from '../AccountSentenceList/AccountSentenceList'
import StoryLink from '../StoryLink/StoryLink'

const Favourites = () => {
  return (
    <>
      <h1>Your Favourites</h1>
      <AccountSentenceList query={Favourites.query} />
    </>
  )
}

Favourites.query = gql`
  query LikedSentences($search: String, $offset: Int) {
    likedSentences(search: $search, offset: $offset) {
      count
      sentences {
        ...SentenceFragment
      }
    }
  }
  ${StoryLink.fragments.sentence}
`

export default Favourites
