import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client/core'
import Link from 'next/dist/client/link'
import { useContext, useState } from 'react'
import WrittenIdsContext from '../../context/WrittenIdsContext'
import NProgress from '../../services/nprogress'
import Sentence from '../Sentence/Sentence'
import styles from './Account.module.scss'

const Account = () => {
  const nprogress = new NProgress()

  const [writtenIds] = useContext(WrittenIdsContext)
  const [search, setSearch] = useState('')
  const { data, fetchMore } = useQuery(Account.query, {
    variables: {
      search,
    },
  })

  const onClickLogout = async () => {
    nprogress.start()
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    })
    if (response.ok) {
      window.location.href = '/'
      return
    }
    nprogress.done()
  }

  const onClickLoadMore = () => {
    const sentences = data && data.mySentences ? data.mySentences.sentences : []
    const exclude = writtenIds.filter((id) => {
      return sentences && sentences.some((s) => s.id === id)
    })
    const offset = sentences ? sentences.length - exclude.length : 0
    fetchMore({
      variables: {
        offset,
        exclude,
      },
    })
  }

  const hasData = data && data.mySentences
  const hasResults = hasData && data.mySentences.sentences.length

  return (
    <div className={styles.account}>
      <div className={styles.heading}>
        <h1>Account</h1>
        <button type="button" className="link" onClick={onClickLogout}>
          Log Out
        </button>
      </div>
      <label htmlFor="search">Search</label>
      <input
        id="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {hasData ? (
        hasResults ? (
          <>
            <ul className={styles.list}>
              {data.mySentences.sentences.map((sentence) => (
                <li key={sentence.id} className={styles.sentence}>
                  <p>
                    <Link href="/[slug]" as={sentence.slug || sentence.id}>
                      <a>{sentence.content}</a>
                    </Link>
                  </p>
                </li>
              ))}
              {data.mySentences.sentences.length < data.mySentences.count ? (
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

Account.query = gql`
  query MySentences($search: String, $offset: Int, $exclude: [String]) {
    mySentences(search: $search, offset: $offset, exclude: $exclude) {
      count
      sentences {
        ...SentenceFragment
      }
    }
  }
  ${Sentence.fragments.sentence}
`

export default Account
