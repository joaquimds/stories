import { Sentence } from '../models/Sentence'
import { User } from '../models/User'

export const resolvers = {
  Query: {
    sentence: (parent, { id }) => {
      return Sentence.query().findById(id)
    },
    root: () => {
      return {
        id: 'root',
      }
    },
  },
  Root: {
    childCount: () => {
      return Sentence.countChildren(null)
    },
    children: (_, { order, offset }) => {
      return Sentence.getChildren(null, order, offset)
    },
  },
  Sentence: {
    content: ({ content, authorId }) => {
      return authorId ? content : '[deleted]'
    },
    parents: (sentence) => {
      return sentence.getParents()
    },
    childCount: (sentence) => {
      return Sentence.countChildren(sentence.id)
    },
    children: (sentence, { order, offset }) => {
      return Sentence.getChildren(sentence.id, order, offset)
    },
    author: ({ authorId }) => {
      return authorId ? User.query().findById(authorId) : null
    },
  },
  Mutation: {
    addSentenceMutation: async (parent, { content, parentId }, { user }) => {
      const trimmed = content.trim()
      if (!user || !trimmed) {
        return null
      }
      return Sentence.query().insert({
        content: trimmed,
        parentId,
        authorId: user.id,
      })
    },
    deleteSentenceMutation: async (parent, { id }, { user }) => {
      const failedResponse = { success: false }
      if (!user) {
        return failedResponse
      }
      const sentence = await Sentence.query()
        .findById(id)
        .withGraphFetched('children')
      if (!sentence) {
        return failedResponse
      }
      if (sentence.children.length) {
        const updated = await Sentence.query().patchAndFetchById(id, {
          authorId: null,
        })
        return { success: true, sentence: updated }
      }
      await Sentence.query().deleteById(id)
      return { success: true }
    },
  },
}
