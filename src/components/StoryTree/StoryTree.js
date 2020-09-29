import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { ORDERS } from '../../constants'
import * as fragments from '../../graphql/fragments'
import NProgress from '../../services/nprogress'
import Page from '../Page/Page'
import StoryLink from '../StoryLink/StoryLink'
import Write from '../Write/Write'
import styles from './StoryTree.module.scss'

const nprogress = new NProgress()

const StoryTree = ({ slug }) => {
  const [order, setOrder] = useState('score')
  const { data, loading, fetchMore } = useQuery(StoryTree.query, {
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

  const { story, children, childCount } = extractStory(data)
  if (!story) {
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
    fetchMore({
      variables: {
        exclude: children ? children.map((c) => c.ending.id) : [],
      },
    })
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.half} ${styles.top}`}>
        <div className={styles.content}>
          {slug !== '0' ? (
            <Page story={story} />
          ) : (
            <p className={styles.begin}>
              (choose a beginning, start a new story, or{' '}
              <Link href="/library">
                <a>visit the library</a>
              </Link>
              )
            </p>
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
                      key={o.value}
                      className={buttonClass(o.value, order)}
                      onClick={() => setOrder(o.value)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <ul className={styles.children}>
                {children.map((c) => (
                  <li key={c.id}>
                    <StoryLink story={c} />
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
                    (load more)
                  </button>
                </div>
              ) : null}
              <div className={styles.write}>
                <Write parentId={story.id} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

const extractStory = (data) => {
  const story = data?.story
  const children = story ? story.children : []
  const childCount = story ? story.childCount : 0
  return {
    story,
    children,
    childCount,
  }
}

const buttonClass = (order, current) => {
  return `link ${order === current ? 'active' : ''}`
}

StoryTree.propTypes = {
  slug: PropTypes.string,
}

StoryTree.query = gql`
  query Story($slug: String!, $order: Order, $exclude: [String]) {
    story(slug: $slug) {
      id
      title
      liked
      parents {
        ...StoryFragment
      }
      ending {
        ...SentenceFragment
      }
      childCount
      children(order: $order, exclude: $exclude) {
        ...StoryFragment
      }
    }
  }
  ${fragments.story}
`

export default StoryTree
