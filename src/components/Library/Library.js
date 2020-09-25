import { useQuery, gql } from '@apollo/client'
import Link from 'next/link'
import { useState } from 'react'
import { ORDERS } from '../../constants'
import StoryLink from '../StoryLink/StoryLink'
import styles from './Library.module.scss'

const Library = () => {
  const [search, setSearch] = useState('')
  const [order, setOrder] = useState('likes')
  const { data, fetchMore } = useQuery(Library.query, {
    variables: {
      search,
      order,
    },
  })
  const hasData = data && data.stories
  const hasResults = hasData && data.stories.sentences.length

  const onClickLoadMore = () => {
    const sentences = data && data.stories ? data.stories.sentences : []
    fetchMore({
      variables: {
        exclude: sentences.map((s) => s.id),
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
        hasResults ? (
          <>
            {data.stories.sentences.length > 1 ? (
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
              {data.stories.sentences.map(renderSentence)}
              {data.stories.sentences.length < data.stories.count ? (
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

const renderSentence = (sentence) => {
  return (
    <li key={sentence.id} className={styles.story}>
      {sentence.title ? <h2>{sentence.title}</h2> : null}
      <p>
        <Link href="/[slug]" as={`/${sentence.slug || sentence.id}`}>
          <a>{sentence.intro}</a>
        </Link>
      </p>
    </li>
  )
}

const buttonClass = (order, current) => {
  return `link ${order === current ? 'active' : ''}`
}

Library.query = gql`
  query Stories($search: String, $order: Order, $exclude: [String]) {
    stories(search: $search, order: $order, exclude: $exclude) {
      count
      sentences {
        ...SentenceFragment
        intro
      }
    }
  }
  ${StoryLink.fragments.sentence}
`

export default Library
