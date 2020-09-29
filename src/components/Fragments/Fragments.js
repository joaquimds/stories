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
  query MyStories($search: String, $offset: Int) {
    myStories(search: $search, offset: $offset) {
      count
      stories {
        ...StoryFragment
      }
    }
  }
  ${fragments.story}
`

export default Fragments
