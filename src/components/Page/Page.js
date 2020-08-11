import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import { ERRORS } from '../../constants'
import UserContext from '../../context/UserContext'
import Sentence from '../Sentence/Sentence'
import styles from './Page.module.scss'

const LIKE_SENTENCE_MUTATION = gql`
  mutation LikeSentenceMutation($id: String!, $like: Boolean!) {
    likeSentenceMutation(id: $id, like: $like) {
      errorCode
    }
  }
`

const SAVE_SENTENCE_MUTATION = gql`
  mutation SaveSentenceMutation($id: String!, $title: String!) {
    saveSentenceMutation(id: $id, title: $title) {
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
  ${Sentence.fragments.sentence}
`

const Page = ({ sentence }) => {
  const router = useRouter()
  const user = useContext(UserContext)

  const [isSaving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')

  const [deleteSentence, { loading }] = useMutation(DELETE_SENTENCE_MUTATION, {
    variables: { id: sentence.id },
  })

  const [saveSentence, { loading: saveLoading }] = useMutation(
    SAVE_SENTENCE_MUTATION
  )

  const [likeSentence, { loading: likeLoading }] = useMutation(
    LIKE_SENTENCE_MUTATION
  )

  const isAuthor = user && sentence.author && sentence.author.id === user.id
  const setErrorFromCode = (errorCode) => {
    setError(ERRORS[errorCode] || `Unknown error ${errorCode}`)
  }

  const onSubmitSave = async (e) => {
    e.preventDefault()
    await saveSentence({
      variables: { id: sentence.id, title },
      update(
        cache,
        {
          data: {
            saveSentenceMutation: { errorCode, slug },
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
            fragment: Sentence.fragments.sentence,
            data: updated,
          })
        }
        const parent = sentence.parents[sentence.parents.length - 1]
        cache.modify({
          id: `Sentence:${parent.id}`,
          fields: {
            childCount(count) {
              return count > 0 ? count - 1 : count
            },
            children(childRefs, { readField }) {
              return childRefs.filter(
                (childRef) => readField('id', childRef) !== sentence.id
              )
            },
          },
        })
        cache.modify({
          id: 'ROOT_QUERY',
          fields: {
            mySentences(sentenceList, options) {
              return removeSentence(sentence.id, sentenceList, options)
            },
            likedSentences(sentenceList, options) {
              return removeSentence(sentence.id, sentenceList, options)
            },
          },
        })
        if (!parent.id) {
          return router.push('/')
        }
        return router.push('/[slug]', `/${parent.id}`)
      },
    })
  }

  const onClickLike = async () => {
    await likeSentence({
      variables: {
        id: sentence.id,
        like: !sentence.liked,
      },
      update(
        cache,
        {
          data: {
            likeSentenceMutation: { errorCode },
          },
        }
      ) {
        if (errorCode) {
          return setErrorFromCode(errorCode)
        }
        cache.modify({
          id: `Sentence:${sentence.id}`,
          fields: {
            liked() {
              return !sentence.liked
            },
          },
        })
        cache.modify({
          id: 'ROOT_QUERY',
          fields: {
            likedSentences(sentenceList, { DELETE }) {
              return DELETE
            },
          },
        })
      },
    })
  }

  const firstSentence = sentence.parents.filter(({ content, author }) => {
    return content && author
  })[0]
  const description = firstSentence ? firstSentence.content : sentence.content

  return (
    <>
      <Head>
        {sentence.title ? (
          <title>
            {sentence.title} | {process.env.title}
          </title>
        ) : null}
        <meta
          key="og:url"
          property="og:url"
          content={`${process.env.siteUrl}/${sentence.slug || sentence.id}`}
        />
        <meta
          key="og:description"
          property="og:description"
          content={description}
        />
        <meta
          key="twitter:description"
          name="twitter:description"
          content={description}
        />
      </Head>
      {sentence.title ? <h1>{sentence.title}</h1> : null}
      {sentence.parents.map((p) => (
        <p key={p.id} className={styles.content}>
          <Link href="/[slug]" as={`/${p.slug || p.id}`}>
            <a>{p.content}</a>
          </Link>{' '}
        </p>
      ))}
      <p className={styles.content}>{sentence.content}</p>
      {renderAuthors(sentence)}
      {isSaving ? (
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
      ) : user ? (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onClickLike}
            disabled={likeLoading}
            className={`link ${styles.like}`}
          >
            {sentence.liked ? 'unfavourite' : 'favourite'}
          </button>
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
          ) : null}
        </div>
      ) : null}
      {error ? <small className="error">{error}</small> : null}
    </>
  )
}

const renderAuthors = (sentence) => {
  const authors = [sentence, ...sentence.parents]
    .map((s) => s.author)
    .filter(Boolean)
  const authorCounts = {}
  for (const a of authors) {
    if (!authorCounts[a.name]) {
      authorCounts[a.name] = 0
    }
    authorCounts[a.name]++
  }
  const authorNames = Object.keys(authorCounts)
  if (authorNames.length === 0) {
    return null
  }
  if (authorNames.length === 1) {
    return <p>By {authorNames[0]}</p>
  }

  authorNames.sort((a, b) => (authorCounts[a] > authorCounts[b] ? -1 : 1))
  const last = authorNames.pop()
  return (
    <p>
      By {authorNames.join(', ')} and {last}
    </p>
  )
}

const removeSentence = (id, sentenceList, { readField }) => {
  if (!sentenceList) {
    return null
  }
  return {
    count: sentenceList.count > 0 ? sentenceList.count - 1 : 0,
    sentences: sentenceList.sentences.filter(
      (sentenceRef) => readField('id', sentenceRef) !== id
    ),
  }
}

Page.propTypes = {
  sentence: Sentence.propTypes.sentence,
}

export default Page
