import { useQuery, gql } from '@apollo/client'
import Link from 'next/link'
import { useState } from 'react'
import { ORDERS } from '../../constants'
import * as fragments from '../../graphql/fragments'
import styles from './Library.module.scss'

const Library = () => {
  const [search, setSearch] = useState('')
  const [order, setOrder] = useState('score')
  const { data, fetchMore } = useQuery(Library.query, {
    variables: {
      search,
      order,
    },
  })
  const hasData = data && data.stories
  const stories = data?.stories?.stories || []

  const onClickLoadMore = () => {
    fetchMore({
      variables: {
        offset: stories.length,
      },
    })
  }

  return (
    <div className={styles.library}>
      <label htmlFor="search">Search</label>
      <input
        id="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {hasData ? (
        stories.length ? (
          <>
            {stories.length > 1 ? (
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
            <ul className={styles.list}>
              {stories.map(renderStory)}
              {stories.length < data.stories.count ? (
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
          </>
        ) : (
          <p className={styles.info}>(no results)</p>
        )
      ) : (
        <p className={styles.info}>(loading)</p>
      )}
    </div>
  )
}

const renderStory = (story) => {
  return (
    <li key={story.id} className={styles.story}>
      {story.title ? <h2>{story.title}</h2> : null}
      <p>
        <Link href="/[slug]" as={story.permalink}>
          <a>{story.intro}</a>
        </Link>
      </p>
    </li>
  )
}

const buttonClass = (order, current) => {
  return `link ${order === current ? 'active' : ''}`
}

Library.query = gql`
  query Stories($search: String, $order: Order, $offset: Int) {
    stories(search: $search, order: $order, offset: $offset) {
      count
      stories {
        ...StoryFragment
        title
        intro
      }
    }
  }
  ${fragments.story}
`

export default Library
