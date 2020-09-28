import Error from 'next/error'
import { useRouter } from 'next/router'
import StoryTree from '../components/StoryTree/StoryTree'
import withData from '../containers/withData'

const SentencePage = () => {
  const router = useRouter()
  const { slug } = router.query
  if (!slug) {
    return <Error statusCode={404} />
  }
  return <StoryTree slug={slug} />
}

export default withData(SentencePage, { ssr: true })
