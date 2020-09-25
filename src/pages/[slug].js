import Error from 'next/error'
import PropTypes from 'prop-types'
import StoryTree from '../components/StoryTree/StoryTree'
import withData from '../containers/withData'

const SentencePage = ({ slug }) => {
  if (!slug) {
    return <Error statusCode={404} />
  }
  return <StoryTree slug={slug} />
}

SentencePage.propTypes = {
  slug: PropTypes.string,
}

SentencePage.getInitialProps = ({ asPath }) => {
  return { slug: asPath }
}

export default withData(SentencePage, { ssr: true })
