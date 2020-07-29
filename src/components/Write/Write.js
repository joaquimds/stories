import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import * as PropTypes from 'prop-types'
import { useState } from 'react'
import Sentence from '../Sentence/Sentence'
import StoryTree from '../StoryTree/StoryTree'
import styles from './Write.module.scss'

const ADD_SENTENCE_MUTATION = gql`
  mutation AddSentenceMutation($content: String!, $parentId: Int) {
    addSentenceMutation(content: $content, parentId: $parentId) {
      ...SentenceFragment
    }
  }
  ${Sentence.fragments.sentence}
`

const Write = ({ parentId }) => {
  const [content, setContent] = useState('')
  const [addSentence, { loading }] = useMutation(ADD_SENTENCE_MUTATION)
  const router = useRouter()

  const onSubmit = async (e) => {
    e.preventDefault()
    await addSentence({
      variables: {
        content,
        parentId,
      },
      update(cache, { data: { addSentenceMutation: newSentence } }) {
        setContent('')
        const parent = parentId
          ? cache.readFragment({
              id: `Sentence:${parentId}`,
              fragment: StoryTree.fragments.parent,
              fragmentName: 'ParentFragment',
            })
          : null
        cache.writeQuery({
          query: StoryTree.query,
          variables: { id: newSentence.id },
          data: {
            sentence: {
              ...newSentence,
              parent,
              children: [],
            },
          },
        })
        if (parent) {
          cache.writeFragment({
            id: `Sentence:${parentId}`,
            fragment: StoryTree.fragments.parent,
            fragmentName: 'ParentFragment',
            data: {
              ...parent,
              children: [...parent.children, newSentence],
            },
          })
        }
        return router.push('/[id]', `/${newSentence.id}`)
      },
    })
  }

  return (
    <form className={styles.write} onSubmit={onSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write"
      />
      <button disabled={loading || !content}>Submit</button>
    </form>
  )
}
Write.propTypes = {
  parentId: PropTypes.number,
}

export default Write
