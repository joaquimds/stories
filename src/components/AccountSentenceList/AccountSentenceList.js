import { useQuery } from '@apollo/client'
import Link from 'next/link'
import * as PropTypes from 'prop-types'
import { useState } from 'react'
import styles from './AccountSentenceList.module.scss'

const AccountSentenceList = ({ query }) => {
  const [search, setSearch] = useState('')
  const { data, fetchMore } = useQuery(query, {
    variables: {
      search,
    },
  })

  const result = data ? data[Object.keys(data)[0]] : null

  const onClickLoadMore = () => {
    const stories = result ? result.stories : []
    fetchMore({
      variables: {
        offset: stories.length,
      },
    })
  }

  const hasResults = result && result.stories.length

  return (
    <div className={styles['sentence-list']}>
      <label htmlFor="search">Search</label>
      <input
        id="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {result ? (
        hasResults ? (
          <>
            <ul className={styles.list}>
              {result.stories.map((story) => (
                <li key={story.id} className={styles.sentence}>
                  <p>
                    <Link href="/[slug]" as={story.permalink}>
                      <a>
                        {story.parent
                          ? `${story.parent.content || '(begin)'} → `
                          : ''}
                        {story.definedParents && story.definedParents.length
                          ? `${story.definedParents
                              .map((p) => p.content || '(begin)')
                              .join(' · ')} · `
                          : ''}
                        {story.ending.content}
                      </a>
                    </Link>
                  </p>
                </li>
              ))}
              {result.stories.length < result.count ? (
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

AccountSentenceList.propTypes = {
  query: PropTypes.object,
}

export default AccountSentenceList
