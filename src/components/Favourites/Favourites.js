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
  query LikedSentences($search: String, $offset: Int) {
    likedSentences(search: $search, offset: $offset) {
      count
      sentences {
        ...SentenceFragment
      }
    }
  }
  ${fragments.sentence}
`

export default Favourites
