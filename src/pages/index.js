import StoryTree from '../components/StoryTree/StoryTree'
import withData from '../containers/withData'

const Home = () => {
  return <StoryTree id={1} />
}

export default withData(Home, { ssr: true })
