import { gql } from '@apollo/client/core'
import AccountSentenceList from '../AccountSentenceList/AccountSentenceList'
import Sentence from '../Sentence/Sentence'

const Fragments = () => {
  return (
    <>
      <h1>Your Fragments</h1>
      <AccountSentenceList query={Fragments.query} />
    </>
  )
}

Fragments.query = gql`
  query MySentences($search: String, $offset: Int) {
    mySentences(search: $search, offset: $offset) {
      count
      sentences {
        ...SentenceFragment
      }
    }
  }
  ${Sentence.fragments.sentence}
`

export default Fragments
