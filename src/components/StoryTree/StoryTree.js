import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import NProgress from 'nprogress'
import * as PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { ORDERS } from '../../constants'
import Page from '../Page/Page'
import Sentence from '../Sentence/Sentence'
import Write from '../Write/Write'
import styles from './StoryTree.module.scss'

const StoryTree = ({ id }) => {
  const [order, setOrder] = useState('longest')
  const { data, loading } = id
    ? useQuery(StoryTree.queries.sentence, {
        variables: {
          id,
          order,
        },
      })
    : useQuery(StoryTree.queries.beginnings, {
        variables: {
          order,
        },
      })

  const { sentence, children } = extractSentences(id, data)
  useEffect(() => {
    if (loading) {
      NProgress.start()
      return
    }
    NProgress.done()
  }, [loading])

  if (id && !sentence && !loading) {
    return (
      <div className={styles.container}>
        <p className={styles.center}>Not Found</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.half} ${styles.top}`}>
        <div className={styles.content}>
          {sentence ? (
            <Page sentence={sentence} />
          ) : (
            <p className={styles.center}>...</p>
          )}
        </div>
      </div>
      <div className={`${styles.half} ${styles.bottom}`}>
        <div className={styles.content}>
          {children ? (
            <>
              {children.length > 1 ? (
                <div className={styles.sort}>
                  {ORDERS.map((o) => (
                    <button
                      key={o}
                      className={buttonClass(o, order)}
                      onClick={() => setOrder(o.toLowerCase())}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              ) : null}
              <ul className={styles.children}>
                {children.map((c) => (
                  <li key={c.id}>
                    <Sentence sentence={c} />
                  </li>
                ))}
              </ul>
              <div className={styles.write}>
                <Write parentId={sentence ? sentence.id : null} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const extractSentences = (id, data) => {
  if (id) {
    const sentence = data && data.sentence ? data.sentence : null
    const children = sentence && sentence.children
    return { sentence, children }
  }
  const children = data && data.beginnings ? data.beginnings : null
  return { children }
}

const buttonClass = (order, current) => {
  return `link ${order.toLowerCase() === current ? 'active' : ''}`
}

StoryTree.propTypes = {
  id: PropTypes.string,
}

StoryTree.queries = {
  beginnings: gql`
    query Beginnings($order: Order) {
      beginnings(order: $order) {
        ...SentenceFragment
      }
    }
    ${Sentence.fragments.sentence}
  `,
  sentence: gql`
    query Sentence($id: String!, $order: Order) {
      sentence(id: $id) {
        ...SentenceFragment
        parents {
          ...SentenceFragment
        }
        children(order: $order) {
          ...SentenceFragment
        }
      }
    }
    ${Sentence.fragments.sentence}
  `,
}

export default StoryTree
