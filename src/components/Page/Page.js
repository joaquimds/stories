import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { useContext, useState } from 'react'
import { ERRORS } from '../../constants'
import UserContext from '../../context/UserContext'
import * as fragments from '../../graphql/fragments'
import styles from './Page.module.scss'

const LIKE_SENTENCE_MUTATION = gql`
  mutation LikeStoryMutation($id: String!, $like: Boolean!) {
    likeStoryMutation(id: $id, like: $like) {
      errorCode
    }
  }
`

const SAVE_SENTENCE_MUTATION = gql`
  mutation SaveStoryMutation($id: String!, $title: String!) {
    saveStoryMutation(id: $id, title: $title) {
      errorCode
      slug
    }
  }
`

const DELETE_SENTENCE_MUTATION = gql`
  mutation DeleteSentenceMutation($id: String!) {
    deleteSentenceMutation(id: $id) {
      errorCode
      sentence {
        ...SentenceFragment
      }
    }
  }
  ${fragments.sentence}
`

const Page = ({ story }) => {
  const router = useRouter()
  const user = useContext(UserContext)

  const [isSaving, setSaving] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)
  const [isReported, setReported] = useState(false)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')

  const { parents, ending } = story

  const [deleteSentence, { loading }] = useMutation(DELETE_SENTENCE_MUTATION, {
    variables: { id: story.ending.id },
  })

  const [saveSentence, { loading: saveLoading }] = useMutation(
    SAVE_SENTENCE_MUTATION
  )

  const [likeSentence, { loading: likeLoading }] = useMutation(
    LIKE_SENTENCE_MUTATION
  )

  const isAuthor = user && ending.author && ending.author.id === user.id
  const setErrorFromCode = (errorCode) => {
    setError(ERRORS[errorCode] || `Unknown error ${errorCode}`)
  }

  const onSubmitSave = async (e) => {
    e.preventDefault()
    await saveSentence({
      variables: { id: story.id, title },
      update(
        cache,
        {
          data: {
            saveStoryMutation: { errorCode, slug },
          },
        }
      ) {
        if (errorCode) {
          return setErrorFromCode(errorCode)
        }
        cache.modify({
          id: 'ROOT_QUERY',
          fields: {
            stories({ DELETE }) {
              return DELETE
            },
          },
        })
        return router.push('/[slug]', `/${slug}`)
      },
    })
  }

  const onClickDelete = async () => {
    await deleteSentence({
      async update(
        cache,
        {
          data: {
            deleteSentenceMutation: { errorCode, sentence: updated },
          },
        }
      ) {
        if (errorCode) {
          return setErrorFromCode(errorCode)
        }
        if (updated) {
          return cache.writeFragment({
            id: cache.identify(updated),
            fragment: fragments.sentence,
            data: updated,
          })
        }
        const parent = parents[parents.length - 1]
        await cache.reset()
        if (parent.id === '0') {
          return router.push('/')
        }
        return router.push('/[slug]', parent.permalink)
      },
    })
  }

  const onClickLike = async () => {
    await likeSentence({
      variables: {
        id: story.id,
        like: !story.liked,
      },
      update(
        cache,
        {
          data: {
            likeStoryMutation: { errorCode },
          },
        }
      ) {
        if (errorCode) {
          return setErrorFromCode(errorCode)
        }
        cache.modify({
          id: `Story:${story.id}`,
          fields: {
            liked() {
              return !story.liked
            },
          },
        })
        cache.modify({
          id: 'ROOT_QUERY',
          fields: {
            likedStories(sentenceList, { DELETE }) {
              return DELETE
            },
          },
        })
      },
    })
  }

  const onClickReport = async () => {
    setReportLoading(true)
    try {
      const response = await fetch(`/api/report/${ending.id}`, {
        method: 'POST',
        credentials: 'same-origin',
      })
      if (response.ok) {
        return setReported(true)
      }
      setReportLoading(false)
      setError(ERRORS[response.status])
    } catch (e) {
      setError('Unknown error')
    }
  }

  const sentences = parents.map(({ ending }) => ending)
  sentences.push(ending)

  const firstSentence = sentences.filter(({ content, author }) => {
    return content && author
  })[0]
  const metaTitle = story.title
    ? `${story.title} | ${process.env.title}`
    : process.env.title
  const description =
    firstSentence && firstSentence.content
      ? firstSentence.content
      : process.env.description
  const linkableParents = parents.filter((p) => p.ending.content)

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta
          key="og:url"
          property="og:url"
          content={`${process.env.siteUrl}${story.id}`}
        />
        <meta key="og:title" property="og:title" content={metaTitle} />
        <meta
          key="og:description"
          property="og:description"
          content={description}
        />
        <meta key="twitter:title" name="twitter:title" content={metaTitle} />
        <meta
          key="twitter:description"
          name="twitter:description"
          content={description}
        />
      </Head>
      {story.title ? <h1>{story.title}</h1> : null}
      {linkableParents.map((p) => (
        <p key={p.id} className={styles.content}>
          <Link href="/[slug]" as={p.permalink}>
            <a>{p.ending.content}</a>
          </Link>{' '}
        </p>
      ))}
      <p className={styles.content}>{ending.content}</p>
      {renderAuthors(sentences)}
      {isReported ? (
        <p className={styles.reported}>reported</p>
      ) : isSaving ? (
        <form onSubmit={onSubmitSave} className={styles.form}>
          <label htmlFor="title" className={styles.label}>
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className={styles.actions}>
            <button
              disabled={saveLoading || !title}
              className={`link ${styles.save}`}
            >
              save
            </button>
            <button
              type="button"
              onClick={() => setSaving(false)}
              disabled={loading}
              className={`link ${styles.delete}`}
            >
              cancel
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.actions}>
          {user ? (
            <>
              <button
                type="button"
                onClick={onClickLike}
                disabled={likeLoading}
                className={`link ${styles.like}`}
              >
                {story.liked ? 'unfavourite' : 'favourite'}
              </button>
            </>
          ) : null}
          {isAuthor ? (
            <>
              <button
                type="button"
                onClick={() => setSaving(true)}
                disabled={saveLoading}
                className={`link ${styles.save}`}
              >
                title
              </button>
              <button
                type="button"
                onClick={onClickDelete}
                disabled={loading}
                className={`link ${styles.delete}`}
              >
                delete
              </button>
            </>
          ) : ending.author ? (
            <button
              type="button"
              onClick={onClickReport}
              disabled={reportLoading}
              className={`link ${styles.delete}`}
            >
              report
            </button>
          ) : null}
        </div>
      )}
      {error ? <small className="error">{error}</small> : null}
    </>
  )
}

const renderAuthors = (sentences) => {
  const authors = sentences.map((s) => s.author).filter(Boolean)
  const authorCounts = {}
  const authorIndices = {}
  for (let i = 0; i < authors.length; i++) {
    const author = authors[i]
    const key = author.name
    if (!authorCounts[key]) {
      authorCounts[key] = 0
      authorIndices[key] = i
    }
    authorCounts[key]++
  }
  const authorNames = Object.keys(authorCounts)
  if (authorNames.length === 0) {
    return null
  }
  if (authorNames.length === 1) {
    return <p>By {authorNames[0]}</p>
  }

  authorNames.sort((a, b) => {
    if (authorCounts[a] > authorCounts[b]) {
      return -1
    }
    if (authorCounts[a] < authorCounts[b]) {
      return 1
    }
    return authorIndices[a] < authorIndices[b] ? -1 : 1
  })
  const last = authorNames.pop()
  return (
    <p>
      By {authorNames.join(', ')} and {last}
    </p>
  )
}

Page.propTypes = {
  story: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    parents: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        permalink: PropTypes.string,
      })
    ),
    ending: PropTypes.shape({
      id: PropTypes.string,
      content: PropTypes.string,
      author: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      }),
    }),
    liked: PropTypes.bool,
  }),
}

export default Page
