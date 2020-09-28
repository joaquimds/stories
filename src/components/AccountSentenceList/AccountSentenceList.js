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
    const sentences = result ? result.sentences : []
    fetchMore({
      variables: {
        offset: sentences.length,
      },
    })
  }

  const hasResults = result && result.sentences.length

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
              {result.sentences
                .filter((s) => s.content)
                .map((sentence) => (
                  <li key={sentence.id} className={styles.sentence}>
                    <p>
                      <Link href="/[slug]" as={`/${sentence.id}`}>
                        <a>{sentence.content}</a>
                      </Link>
                    </p>
                  </li>
                ))}
              {result.sentences.length < result.count ? (
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
