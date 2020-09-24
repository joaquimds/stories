import Error from 'next/error'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import StoryTree from '../components/StoryTree/StoryTree'
import withData from '../containers/withData'

const SentencePage = ({ path }) => {
  const router = useRouter()
  const { slug } = router.query

  if (!slug) {
    return <Error statusCode={404} />
  }

  return <StoryTree slug={slug} path={path} />
}

SentencePage.propTypes = {
  path: PropTypes.string,
}

SentencePage.getInitialProps = ({ req, asPath }) => {
  if (typeof window === 'undefined') {
    return { path: req.query.path }
  }
  const queryString = asPath.split('?')[1]
  if (queryString) {
    const urlParams = new URLSearchParams(queryString)
    return { path: urlParams.get('path') }
  }
}

export default withData(SentencePage, { ssr: true })
