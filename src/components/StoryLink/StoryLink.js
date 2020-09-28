import Link from 'next/link'
import PropTypes from 'prop-types'
import styles from './StoryLink.module.scss'

const StoryLink = ({ story }) => {
  return (
    <div className={styles.card}>
      <p>
        <Link href="/[slug]" as={story.id}>
          <a className={styles.link}>{story.ending.content}</a>
        </Link>
      </p>
    </div>
  )
}

StoryLink.propTypes = {
  story: PropTypes.shape({
    id: PropTypes.string,
    ending: PropTypes.shape({
      content: PropTypes.string,
    }),
  }),
}

export default StoryLink
