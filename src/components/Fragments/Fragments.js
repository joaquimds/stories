import { gql } from '@apollo/client/core'
import * as fragments from '../../graphql/fragments'
import AccountSentenceList from '../AccountSentenceList/AccountSentenceList'

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
  ${fragments.sentence}
`

export default Fragments
