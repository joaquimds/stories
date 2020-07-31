import Link from 'next/link'
import * as PropTypes from 'prop-types'
import styles from './Page.module.scss'

const Page = ({ sentence }) => {
  return (
    <>
      <p>
        {sentence.parents.map((p) => (
          <span key={p.id}>
            <Link href="/[id]" as={`/${p.id}`}>
              <a>{p.content}</a>
            </Link>{' '}
          </span>
        ))}
      </p>
      <p className={styles.content}>{sentence.content}</p>
    </>
  )
}

Page.propTypes = {
  sentence: PropTypes.shape({
    content: PropTypes.string,
    parents: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.string,
      })
    ),
  }),
}

export default Page
