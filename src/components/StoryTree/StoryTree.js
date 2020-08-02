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
  const { data, loading, fetchMore } = useQuery(StoryTree.queries.sentence, {
    variables: {
      id,
      order,
    },
  })
  useEffect(() => {
    if (loading) {
      NProgress.start()
      return
    }
    NProgress.done()
  }, [loading])

  const { sentence, children, childCount } = extractSentences(data)
  if (!sentence && !loading) {
    return (
      <div className={styles.container}>
        <p className={styles.center}>Not Found</p>
      </div>
    )
  }

  const onClickLoadMore = () => {
    fetchMore({
      variables: {
        offset: children && children.length,
      },
    })
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.half} ${styles.top}`}>
        <div className={styles.content}>
          {id && sentence ? (
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
                      type="button"
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
              {children.length < childCount ? (
                <div className={styles['load-more']}>
                  <button
                    type="button"
                    className="link"
                    onClick={onClickLoadMore}
                  >
                    Load More
                  </button>
                </div>
              ) : null}
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

const extractSentences = (data) => {
  const sentence = data && data.sentence ? data.sentence : null
  const children = sentence && sentence.children
  const childCount = sentence && sentence.childCount
  return { sentence, children, childCount }
}

const buttonClass = (order, current) => {
  return `link ${order.toLowerCase() === current ? 'active' : ''}`
}

StoryTree.propTypes = {
  id: PropTypes.string,
}

StoryTree.queries = {
  sentence: gql`
    query Sentence($id: String, $order: Order, $offset: Int) {
      sentence(id: $id) {
        ...SentenceFragment
        parents {
          ...SentenceFragment
        }
        childCount
        children(order: $order, offset: $offset) {
          ...SentenceFragment
        }
      }
    }
    ${Sentence.fragments.sentence}
  `,
}

export default StoryTree
