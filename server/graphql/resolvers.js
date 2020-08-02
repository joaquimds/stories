import { Sentence } from '../models/Sentence'
import { User } from '../models/User'

export const resolvers = {
  Query: {
    sentence: (parent, { id }) => {
      return Sentence.query().findById(id)
    },
    beginnings: (parent, { order }) => {
      return Sentence.getChildren(null, order)
    },
  },
  Sentence: {
    content: ({ content, authorId }) => {
      return authorId ? content : '[deleted]'
    },
    parents: (sentence) => {
      return sentence.getParents()
    },
    children: (sentence, args) => {
      return Sentence.getChildren(sentence.id, args.order)
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
