import withData from '../containers/withData'

const Home = () => {
  return <div className="index" />
}

export default withData(Home, { ssr: true })
