import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Link from 'next/link'
import { useRouter } from 'next/router'
import * as PropTypes from 'prop-types'
import { useContext, useState } from 'react'
import { ERRORS } from '../../constants'
import UserContext from '../../context/UserContext'
import * as fragments from '../../graphql/fragments'
import styles from './Write.module.scss'

const ADD_SENTENCE_MUTATION = gql`
  mutation AddSentenceMutation($content: String!, $parentId: String!) {
    addSentenceMutation(content: $content, parentId: $parentId) {
      errorCode
      story {
        ...StoryFragment
      }
    }
  }
  ${fragments.story}
`

const Write = ({ parentId }) => {
  const router = useRouter()
  const user = useContext(UserContext)
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
            addSentenceMutation: { errorCode, story: newStory },
          },
        }
      ) {
        if (errorCode) {
          return setErrorFromCode(errorCode)
        }
        setContent('')
        await router.push('/[slug]', `/${newStory.id}`)
        updateCache(cache, parentId, newStory)
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
        maxLength={280}
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
      {error ? (
        <small className={`error ${styles.error}`}>{error}</small>
      ) : null}
    </form>
  )
}

const updateCache = (cache, parentId, newStory) => {
  const newStoryRef = cache.writeFragment({
    data: newStory,
    fragment: fragments.story,
    fragmentName: 'StoryFragment',
  })
  cache.modify({
    id: `Story:${parentId}`,
    fields: {
      childCount(count) {
        return count && count > 0 ? count + 1 : 1
      },
      children(childRefs) {
        return [...childRefs, newStoryRef]
      },
    },
  })
  cache.modify({
    id: 'ROOT_QUERY',
    fields: {
      mySentences({ DELETE }) {
        return DELETE
      },
    },
  })
}

Write.propTypes = {
  parentId: PropTypes.string,
}

export default Write
