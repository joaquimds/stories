import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import NProgress from 'nprogress'
import * as PropTypes from 'prop-types'
import { useEffect } from 'react'
import Sentence from '../Sentence/Sentence'
import Write from '../Write/Write'
import styles from './StoryTree.module.scss'

const StoryTree = ({ id }) => {
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
    <div className={styles.container}>{renderSentences(sentence, loading)}</div>
  )
}

const renderSentences = (sentence, loading) => {
  if (!sentence) {
    return loading ? null : <Sentence sentence={{ content: 'Not Found' }} />
  }
  return (
    <>
      <div className={styles.column}>
        {sentence.parent ? <Sentence sentence={sentence.parent} /> : null}
      </div>
      <div className={styles.column}>
        <ul className={styles.children}>
          <li>
            <Sentence sentence={sentence} />
          </li>
          <li>
            <Write parentId={sentence.parent ? sentence.parent.id : null} />
          </li>
        </ul>
      </div>
      <div className={styles.column}>
        <ul className={styles.children}>
          {sentence.children.map((c) => (
            <li key={c.id}>
              <Sentence sentence={c} />
            </li>
          ))}
          <li>
            <Write parentId={sentence.id} />
          </li>
        </ul>
      </div>
    </>
  )
}

StoryTree.propTypes = {
  id: PropTypes.number,
}

StoryTree.fragments = {}
StoryTree.fragments.parent = gql`
  fragment ParentFragment on Sentence {
    ...SentenceFragment
    children {
      ...SentenceFragment
    }
  }
  ${Sentence.fragments.sentence}
`
StoryTree.fragments.story = gql`
  fragment StoryFragment on Sentence {
    ...SentenceFragment
    parent {
      ...ParentFragment
    }
    children {
      ...SentenceFragment
    }
  }
  ${StoryTree.fragments.parent}
  ${Sentence.fragments.sentence}
`

StoryTree.query = gql`
  query Sentence($id: Int!) {
    sentence(id: $id) {
      ...StoryFragment
    }
  }
  ${StoryTree.fragments.story}
`

export default StoryTree
