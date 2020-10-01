import { gql } from '@apollo/client/core'
import * as fragments from '../../graphql/fragments'
import AccountSentenceList from '../AccountSentenceList/AccountSentenceList'

const Links = () => {
  return (
    <>
      <h1>Your Links</h1>
      <AccountSentenceList query={Links.query} />
    </>
  )
}

Links.query = gql`
  query MyLinks($search: String, $offset: Int) {
    myLinks(search: $search, offset: $offset) {
      count
      stories {
        parent {
          ...StoryFragment
        }
        ...StoryFragment
      }
    }
  }
  ${fragments.story}
`

export default Links
