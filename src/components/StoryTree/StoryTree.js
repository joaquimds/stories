import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as PropTypes from 'prop-types'
import { useContext, useEffect, useState } from 'react'
import { ORDERS } from '../../constants'
import WrittenIdsContext from '../../context/WrittenIdsContext'
import NProgress from '../../services/nprogress'
import Page from '../Page/Page'
import Sentence from '../Sentence/Sentence'
import Write from '../Write/Write'
import styles from './StoryTree.module.scss'

const nprogress = new NProgress()

const StoryTree = ({ slug }) => {
  const [order, setOrder] = useState('longest')
  const [writtenIds] = useContext(WrittenIdsContext)
  const { data, loading, fetchMore } = useQuery(StoryTree.queries.sentence, {
    variables: {
      slug,
      order,
    },
  })
  useEffect(() => {
    if (loading) {
      nprogress.start()
      return
    }
    nprogress.done()
  }, [loading])

  const { sentence, children, childCount } = extractSentences(data)
  if (!sentence) {
    if (!loading) {
      return (
        <div className={styles.container}>
          <p className={styles.center}>Not Found</p>
        </div>
      )
    }
    return (
      <div className={styles.container}>
        <div className={`${styles.half} ${styles.top}`} />
        <div className={`${styles.half} ${styles.bottom}`} />
      </div>
    )
  }

  const onClickLoadMore = () => {
    const exclude = writtenIds.filter((id) => {
      return children && children.some((c) => c.id === id)
    })
    const offset = children ? children.length - exclude.length : 0
    fetchMore({
      variables: {
        offset,
        exclude,
      },
    })
  }

  return (
    <div className={styles.container}>
      {slug ? (
        <div className={`${styles.half} ${styles.top}`}>
          <div className={styles.content}>
            <Page sentence={sentence} />
          </div>
        </div>
      ) : (
        <div className={`${styles.half}`}>
          <div className={styles.content}>
            <p className={`${styles.center} ${styles.begin}`}>(begin)</p>
          </div>
        </div>
      )}
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
                    (Load More)
                  </button>
                </div>
              ) : null}
              <div className={styles.write}>
                <Write parentId={sentence.id} />
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
  slug: PropTypes.string,
}

StoryTree.queries = {
  sentence: gql`
    query Sentence(
      $slug: String
      $order: Order
      $offset: Int
      $exclude: [String]
    ) {
      sentence(slug: $slug) {
        ...SentenceFragment
        parents {
          ...SentenceFragment
        }
        childCount
        children(order: $order, offset: $offset, exclude: $exclude) {
          ...SentenceFragment
        }
      }
    }
    ${Sentence.fragments.sentence}
  `,
}

export default StoryTree
