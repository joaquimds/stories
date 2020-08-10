import { useQuery, gql } from '@apollo/client'
import Link from 'next/link'
import { useState } from 'react'
import Sentence from '../Sentence/Sentence'
import styles from './Library.module.scss'

const Library = () => {
  const [search, setSearch] = useState('')
  const { data } = useQuery(Library.query, {
    fetchPolicy: 'no-cache',
    variables: {
      search,
    },
  })
  const hasData = data && data.stories
  const hasResults = hasData && data.stories.length
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
          <ul className={styles.list}>{data.stories.map(renderSentence)}</ul>
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
  const firstSentence = sentence.parents.filter(({ content, author }) => {
    return content && author
  })[0]
  const content = firstSentence ? firstSentence.content : sentence.content
  return (
    <li key={sentence.id} className={styles.story}>
      {sentence.title ? <h2>{sentence.title}</h2> : null}
      <p>
        <Link href="/[slug]" as={sentence.slug || sentence.id}>
          <a>{content}</a>
        </Link>
      </p>
    </li>
  )
}

Library.query = gql`
  query Stories($search: String) {
    stories(search: $search) {
      ...SentenceFragment
      parents {
        ...SentenceFragment
      }
    }
  }
  ${Sentence.fragments.sentence}
`

export default Library
