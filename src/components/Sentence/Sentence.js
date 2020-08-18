import gql from 'graphql-tag'
import Link from 'next/link'
import * as PropTypes from 'prop-types'
import styles from './Sentence.module.scss'

const Sentence = ({ sentence }) => {
  return (
    <div className={styles.card}>
      <p>
        <Link href="/[slug]" as={`/${sentence.slug || sentence.id}`}>
          <a className={styles.link}>{sentence.content}</a>
        </Link>
      </p>
    </div>
  )
}
const SentenceType = {
  id: PropTypes.string,
  content: PropTypes.string,
  slug: PropTypes.string,
  author: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
}
Sentence.propTypes = {
  sentence: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    slug: PropTypes.string,
    children: PropTypes.arrayOf(PropTypes.shape(SentenceType)),
  }),
}
Sentence.fragments = {
  sentence: gql`
    fragment SentenceFragment on Sentence {
      id
      slug
      title
      content
      author {
        id
        name
      }
      liked
    }
  `,
}

export default Sentence
