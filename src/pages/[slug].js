import Error from 'next/error'
import PropTypes from 'prop-types'
import StoryTree from '../components/StoryTree/StoryTree'
import withData from '../containers/withData'

const SentencePage = ({ permalink }) => {
  if (!permalink) {
    return <Error statusCode={404} />
  }
  return <StoryTree permalink={permalink} />
}

SentencePage.propTypes = {
  permalink: PropTypes.string,
}

SentencePage.getInitialProps = ({ asPath }) => {
  return { permalink: asPath }
}

export default withData(SentencePage, { ssr: true })
