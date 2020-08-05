import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Link from 'next/link'
import { useRouter } from 'next/router'
import * as PropTypes from 'prop-types'
import { useContext, useState } from 'react'
import { ERRORS, ORDERS } from '../../constants'
import UserContext from '../../context/UserContext'
import WrittenIdsContext from '../../context/WrittenIdsContext'
import Sentence from '../Sentence/Sentence'
import StoryTree from '../StoryTree/StoryTree'
import styles from './Write.module.scss'

const ADD_SENTENCE_MUTATION = gql`
  mutation AddSentenceMutation($content: String!, $parentId: String) {
    addSentenceMutation(content: $content, parentId: $parentId) {
      errorCode
      sentence {
        ...SentenceFragment
      }
    }
  }
  ${Sentence.fragments.sentence}
`

const Write = ({ parentId }) => {
  const router = useRouter()
  const user = useContext(UserContext)
  const [writtenIds, setWrittenIds] = useContext(WrittenIdsContext)
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [addSentence, { loading }] = useMutation(ADD_SENTENCE_MUTATION)

  const setErrorFromCode = (errorCode) => {
    setError(ERRORS[errorCode] || `Unknown error ${errorCode}`)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    await addSentence({
      variables: {
        content,
        parentId,
      },
      async update(
        cache,
        {
          data: {
            addSentenceMutation: { errorCode, sentence: newSentence },
          },
        }
      ) {
        if (errorCode) {
          return setErrorFromCode(errorCode)
        }
        setContent('')
        await router.push('/[slug]', `/${newSentence.id}`)
        for (const order of ORDERS) {
          const queryVariables = { order: order.toLowerCase(), id: parentId }
          updateCache(cache, queryVariables, newSentence)
        }
        setWrittenIds([...writtenIds, newSentence.id])
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
      {error ? <small className={styles.error}>{error}</small> : null}
    </form>
  )
}

const updateCache = (cache, variables, newSentence) => {
  try {
    const { sentence } = cache.readQuery({
      query: StoryTree.queries.sentence,
      variables,
    })
    return cache.writeQuery({
      query: StoryTree.queries.sentence,
      variables,
      data: {
        sentence: {
          ...sentence,
          childCount: sentence.childCount + 1,
          children: [newSentence],
        },
      },
    })
    // eslint-disable-next-line no-empty
  } catch (e) {}
}

Write.propTypes = {
  parentId: PropTypes.string,
}

export default Write
