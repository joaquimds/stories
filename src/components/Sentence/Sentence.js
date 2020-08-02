import gql from 'graphql-tag'
import Link from 'next/link'
import * as PropTypes from 'prop-types'
import styles from './Sentence.module.scss'

const Sentence = ({ sentence }) => {
  return (
    <div className={styles.card}>
      <p>
        <Link href="/[id]" as={`/${sentence.id}`}>
          <a className={styles.link}>{sentence.content}</a>
        </Link>
      </p>
    </div>
  )
}
const SentenceType = {
  id: PropTypes.string,
  content: PropTypes.string,
  author: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
  }),
}
Sentence.propTypes = {
  sentence: PropTypes.shape({
    ...SentenceType,
    children: PropTypes.arrayOf(PropTypes.shape(SentenceType)),
    parent: PropTypes.shape(SentenceType),
  }),
}
Sentence.fragments = {
  sentence: gql`
    fragment SentenceFragment on Sentence {
      id
      content
      author {
        id
        username
      }
    }
  `,
}

export default Sentence
