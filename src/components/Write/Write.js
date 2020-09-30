import { useMutation, useQuery } from '@apollo/react-hooks'
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

const LINK_SENTENCE_MUTATION = gql`
  mutation LinkSentenceMutation($parentId: String!, $childId: String!) {
    linkSentenceMutation(parentId: $parentId, childId: $childId) {
      errorCode
      story {
        ...StoryFragment
      }
    }
  }
  ${fragments.story}
`

const OTHER_SENTENCES_QUERY = gql`
  query OtherSentences($from: String!, $search: String, $offset: Int) {
    otherSentences(from: $from, search: $search, offset: $offset) {
      count
      sentences {
        ...SentenceFragment
      }
    }
  }
  ${fragments.sentence}
`

const Write = ({ parentId }) => {
  const router = useRouter()
  const user = useContext(UserContext)
  const [isWriting, setWriting] = useState(true)
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)
  const { loading: searchLoading, data, fetchMore } = useQuery(
    OTHER_SENTENCES_QUERY,
    {
      skip: isWriting,
      variables: {
        from: parentId,
        search,
      },
    }
  )
  const [addSentence, { loading }] = useMutation(ADD_SENTENCE_MUTATION)
  const [linkSentence, { loading: loadingLink }] = useMutation(
    LINK_SENTENCE_MUTATION
  )

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

  const onClickChild = async (childId) => {
    await linkSentence({
      variables: {
        parentId,
        childId,
      },
      async update(
        cache,
        {
          data: {
            linkSentenceMutation: { errorCode, story: newStory },
          },
        }
      ) {
        if (errorCode) {
          return setErrorFromCode(errorCode)
        }
        await router.push('/[slug]', `/${newStory.id}`)
        updateCache(cache, parentId, newStory)
      },
    })
  }

  const otherSentences = data?.otherSentences?.sentences || []
  const otherSentenceCount = data?.otherSentences?.count || 0
  const onClickLoadMore = () => {
    fetchMore({
      variables: {
        offset: otherSentences.length,
      },
    })
  }
  return (
    <div className={`${styles.write} ${!isWriting ? styles.expand : ''}`}>
      <div className={styles.tabs}>
        <div className={styles.tab}>
          <button
            type="button"
            className={`link ${isWriting ? 'active' : ''}`}
            onClick={() => setWriting(true)}
          >
            Write
          </button>
        </div>
        <div className={styles.tab}>
          <button
            type="button"
            className={`link ${!isWriting ? 'active' : ''}`}
            onClick={() => setWriting(false)}
            disabled={!user}
          >
            Link
          </button>
        </div>
      </div>
      {isWriting ? (
        <form onSubmit={onSubmit}>
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
      ) : (
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.results}>
            {searchLoading ? (
              <p>loading...</p>
            ) : otherSentences.length ? (
              <ul>
                {otherSentences.map((r) => (
                  <li key={r.id}>
                    <button
                      className="link"
                      type="button"
                      onClick={() => onClickChild(r.id)}
                      disabled={loadingLink}
                    >
                      {r.content}
                    </button>
                  </li>
                ))}
                {otherSentences.length < otherSentenceCount ? (
                  <li className={styles['load-more']}>
                    <button
                      className="link"
                      type="button"
                      onClick={onClickLoadMore}
                    >
                      (load more)
                    </button>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p>no results</p>
            )}
          </div>
        </div>
      )}
    </div>
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
      myStories({ DELETE }) {
        return DELETE
      },
    },
  })
}

Write.propTypes = {
  parentId: PropTypes.string,
}

export default Write
