import { useQuery } from '@apollo/client'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { ORDERS } from '../../constants'
import styles from './StoryList.module.scss'

const StoryList = ({ query }) => {
  const [search, setSearch] = useState('')
  const [order, setOrder] = useState('score')
  const { data, fetchMore } = useQuery(query, {
    variables: {
      search,
      order,
    },
  })
  const result = data ? data[Object.keys(data)[0]] : null
  const stories = result?.stories || []
  const count = result?.count || 0

  const onClickLoadMore = () => {
    fetchMore({
      variables: {
        offset: stories.length,
      },
    })
  }

  return (
    <div className={styles['story-list']}>
      <label htmlFor="search">Search</label>
      <input
        id="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {result ? (
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
              {stories.length < count ? (
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
          <a>{story.keySentences.map((p) => p.content).join(' → ')}</a>
        </Link>
      </p>
    </li>
  )
}

const buttonClass = (order, current) => {
  return `link ${order === current ? 'active' : ''}`
}

StoryList.propTypes = {
  query: PropTypes.object,
}

export default StoryList
