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

  const isAuthor = user && sentence.author && sentence.author.id === user.id
  const setErrorFromCode = (errorCode) => {
    setError(ERRORS[errorCode] || `Unknown error ${errorCode}`)
  }

  const onClickSave = async () => {
    await saveSentence({
      variables: { id: sentence.id, title },
      update(
        _,
        {
          data: {
            saveSentenceMutation: { errorCode, slug },
          },
        }
      ) {
        if (errorCode) {
          return setErrorFromCode(errorCode)
        }
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
        if (!parent.id) {
          return router.push('/')
        }
        return router.push('/[slug]', `/${parent.id}`)
      },
    })
  }

  const { slug } = router.query
  const highlightContent = slug !== sentence.slug

  return (
    <>
      <Head>
        <meta
          key="og:url"
          property="og:url"
          content={`${process.env.siteUrl}/${sentence.id}`}
        />
        <meta
          key="og:description"
          property="og:description"
          content={sentence.content}
        />
        <meta
          key="twitter:description"
          name="twitter:description"
          content={sentence.content}
        />
      </Head>
      {sentence.title ? <h1>{sentence.title}</h1> : null}
      <p>
        {sentence.parents.map((p) => (
          <span key={p.id}>
            <Link href="/[slug]" as={`/${p.slug || p.id}`}>
              <a>{p.content}</a>
            </Link>{' '}
          </span>
        ))}
        {!highlightContent ? <span>{sentence.content}</span> : null}
      </p>
      {highlightContent ? (
        <p className={styles.content}>{sentence.content}</p>
      ) : null}
      {isSaving ? (
        <>
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
              type="button"
              onClick={onClickSave}
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
        </>
      ) : isAuthor ? (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => setSaving(true)}
            disabled={saveLoading}
            className={`link ${styles.save}`}
          >
            save
          </button>
          <button
            type="button"
            onClick={onClickDelete}
            disabled={loading}
            className={`link ${styles.delete}`}
          >
            delete
          </button>
        </div>
      ) : null}
      {error ? <small className={styles.error}>{error}</small> : null}
    </>
  )
}

Page.propTypes = {
  sentence: Sentence.propTypes.sentence,
}

export default Page
