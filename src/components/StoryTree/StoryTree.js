import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import NProgress from 'nprogress'
import * as PropTypes from 'prop-types'
import { useContext, useEffect } from 'react'
import UserContext from '../../context/UserContext'
import Page from '../Page/Page'
import Sentence from '../Sentence/Sentence'
import Write from '../Write/Write'
import styles from './StoryTree.module.scss'

const StoryTree = ({ id }) => {
  const user = useContext(UserContext)
  const { data, loading } = useQuery(StoryTree.query, {
    variables: {
      id,
    },
  })

  const sentence = data && data.sentence ? data.sentence : null
  useEffect(() => {
    if (loading) {
      NProgress.start()
      return
    }
    NProgress.done()
  }, [loading])

  return (
    <div className={styles.container}>
      {renderSentences(sentence, loading, user)}
    </div>
  )
}

const renderSentences = (sentence, loading, user) => {
  if (!sentence && !loading) {
    return <p className={styles['not-found']}>Not Found</p>
  }
  return (
    <>
      <div className={`${styles.half} ${styles.top}`}>
        <div className={styles.content}>
          {sentence ? <Page sentence={sentence} /> : null}
        </div>
      </div>
      <div className={`${styles.half} ${styles.bottom}`}>
        <div className={styles.content}>
          {sentence ? (
            <>
              <ul className={styles.children}>
                {sentence.children.map((c) => (
                  <li key={c.id}>
                    <Sentence sentence={c} />
                  </li>
                ))}
              </ul>
              {user ? (
                <div className={styles.write}>
                  <Write parentId={sentence.id} />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}

StoryTree.propTypes = {
  id: PropTypes.number,
}

StoryTree.query = gql`
  query Sentence($id: Int!) {
    sentence(id: $id) {
      ...SentenceFragment
      parents {
        ...SentenceFragment
      }
      children {
        ...SentenceFragment
      }
    }
  }
  ${Sentence.fragments.sentence}
`

export default StoryTree
