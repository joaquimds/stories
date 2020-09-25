import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Link from 'next/link'
import * as PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { ORDERS } from '../../constants'
import NProgress from '../../services/nprogress'
import Page from '../Page/Page'
import StoryLink from '../StoryLink/StoryLink'
import Write from '../Write/Write'
import styles from './StoryTree.module.scss'

const nprogress = new NProgress()

const StoryTree = ({ permalink }) => {
  console.log('rendering', permalink)
  const [order, setOrder] = useState('likes')
  const { data, loading, fetchMore } = useQuery(StoryTree.query, {
    variables: {
      permalink,
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

  console.log('b', story.beginning)
  const onClickLoadMore = () => {
    fetchMore({
      variables: {
        exclude: children ? children.map((c) => c.id) : [],
      },
    })
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.half} ${styles.top}`}>
        <div className={styles.content}>
          {permalink ? (
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
  const story = data && data.story ? data.story : null
  const children = story && story.children
  const childCount = story && story.childCount
  return { story, children, childCount }
}

const buttonClass = (order, current) => {
  return `link ${order === current ? 'active' : ''}`
}

StoryTree.propTypes = {
  permalink: PropTypes.string,
}

StoryTree.fragments = {
  story: gql`
    fragment StoryFragment on Story {
      id
      ending {
        ...SentenceFragment
      }
    }
    ${StoryLink.fragments.sentence}
  `,
}

StoryTree.query = gql`
  query Story($permalink: String, $order: Order, $exclude: [String]) {
    story(permalink: $permalink) {
      id
      title
      liked
      beginning {
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
  ${StoryTree.fragments.story}
`

export default StoryTree
