import { gql } from '@apollo/client/core'
import AccountSentenceList from '../AccountSentenceList/AccountSentenceList'
import Sentence from '../Sentence/Sentence'

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
  ${Sentence.fragments.sentence}
`

export default Favourites
