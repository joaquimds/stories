import Library from '../components/Library/Library'
import withData from '../containers/withData'

const LibraryPage = () => (
  <>
    <h1>Library</h1>
    <Library />
  </>
)

export default withData(LibraryPage, { ssr: true })
