import { useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import UserContext from '../../context/UserContext'
import Sentence from '../Sentence/Sentence'
import styles from './Page.module.scss'
import Head from 'next/head'
import NHead from 'next/dist/next-server/lib/head'

const DELETE_SENTENCE_MUTATION = gql`
  mutation DeleteSentenceMutation($id: String!) {
    deleteSentenceMutation(id: $id) {
      success
      sentence {
        ...SentenceFragment
      }
    }
  }
  ${Sentence.fragments.sentence}
`

const Page = ({ sentence }) => {
  const user = useContext(UserContext)
  const router = useRouter()
  const [deleteSentence, { loading }] = useMutation(DELETE_SENTENCE_MUTATION, {
    variables: { id: sentence.id },
  })
  const isAuthor = user && sentence.author && sentence.author.id === user.id
  const onClickDelete = async () => {
    await deleteSentence({
      async update(
        cache,
        {
          data: {
            deleteSentenceMutation: { success, sentence: updated },
          },
        }
      ) {
        if (!success) {
          return
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
        if (parent.id === 'root') {
          return router.push('/')
        }
        return router.push('/[id]', `/${parent.id}`)
      },
    })
  }
  return (
    <>
      <Head>
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
      <p>
        {sentence.parents.map((p) => (
          <span key={p.id}>
            <Link href="/[id]" as={`/${p.id}`}>
              <a>{p.content}</a>
            </Link>{' '}
          </span>
        ))}
      </p>
      <p className={styles.content}>{sentence.content}</p>
      {isAuthor ? (
        <button
          type="button"
          onClick={onClickDelete}
          disabled={loading}
          className={`link ${styles.delete}`}
        >
          delete
        </button>
      ) : null}
    </>
  )
}

Page.propTypes = {
  sentence: Sentence.propTypes.sentence,
}

export default Page
