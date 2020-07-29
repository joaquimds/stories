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
Sentence.propTypes = {
  sentence: PropTypes.shape({
    id: PropTypes.number,
    content: PropTypes.string,
  }),
}
Sentence.fragments = {
  sentence: gql`
    fragment SentenceFragment on Sentence {
      id
      content
      author {
        username
      }
    }
  `,
}

export default Sentence
