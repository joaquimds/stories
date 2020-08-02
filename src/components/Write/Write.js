import { useApolloClient, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Link from 'next/link'
import { useRouter } from 'next/router'
import * as PropTypes from 'prop-types'
import { useContext, useState } from 'react'
import UserContext from '../../context/UserContext'
import Sentence from '../Sentence/Sentence'
import StoryTree from '../StoryTree/StoryTree'
import styles from './Write.module.scss'
import { ORDERS } from '../../constants'

const ADD_SENTENCE_MUTATION = gql`
  mutation AddSentenceMutation($content: String!, $parentId: String) {
    addSentenceMutation(content: $content, parentId: $parentId) {
      ...SentenceFragment
    }
  }
  ${Sentence.fragments.sentence}
`

const Write = ({ parentId }) => {
  const user = useContext(UserContext)
  const [content, setContent] = useState('')
  const [addSentence, { loading }] = useMutation(ADD_SENTENCE_MUTATION)
  const router = useRouter()
  const client = useApolloClient()

  const onSubmit = async (e) => {
    e.preventDefault()
    await addSentence({
      variables: {
        content,
        parentId,
      },
      async update(cache, { data: { addSentenceMutation: newSentence } }) {
        setContent('')
        await router.push('/[id]', `/${newSentence.id}`)
        await client.resetStore()
      },
    })
  }

  return (
    <form className={styles.write} onSubmit={onSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write"
        disabled={!user}
      />
      {user ? (
        <button className="button" disabled={loading || !content || !user}>
          Submit
        </button>
      ) : (
        <Link href="/login">
          <a className="button">Login to contribute</a>
        </Link>
      )}
    </form>
  )
}

Write.propTypes = {
  parentId: PropTypes.string,
}

export default Write
