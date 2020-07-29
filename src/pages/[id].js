import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Error from 'next/error'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import { useEffect } from 'react'
import withData from '../containers/withData'

const SENTENCE_QUERY = gql`
  query Sentence($id: Int!) {
    sentence(id: $id) {
      id
      content
    }
  }
`

const SentencePage = () => {
  const router = useRouter()
  const { id } = router.query
  const { data, loading } = useQuery(SENTENCE_QUERY, {
    variables: {
      id,
    },
  })

  const sentence = data && data.sentence ? data.sentence : null
  useEffect(() => {
    if (loading) {
      NProgress.start()
      return
    }
    NProgress.done()
  }, [loading])

  if (!sentence) {
    if (!loading) {
      return <Error statusCode={404} />
    }
    return null
  }

  return <p>{sentence.content}</p>
}

export default withData(SentencePage, { ssr: true })
