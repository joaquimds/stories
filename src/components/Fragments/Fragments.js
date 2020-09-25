import { gql } from '@apollo/client/core'
import AccountSentenceList from '../AccountSentenceList/AccountSentenceList'
import StoryLink from '../StoryLink/StoryLink'

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
  ${StoryLink.fragments.sentence}
`

export default Fragments
