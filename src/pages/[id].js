import Error from 'next/error'
import { useRouter } from 'next/router'
import StoryTree from '../components/StoryTree/StoryTree'
import withData from '../containers/withData'

const SentencePage = () => {
  const router = useRouter()
  const id = Number(router.query.id)

  if (!id) {
    return <Error statusCode={404} />
  }

  return <StoryTree id={id} />
}

export default withData(SentencePage, { ssr: true })
