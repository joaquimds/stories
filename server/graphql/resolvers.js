import { Sentence } from '../models/Sentence'
import { User } from '../models/User'

export const resolvers = {
  Query: {
    sentence: (parent, { id }) => {
      return Sentence.query().findById(id)
    },
  },
  Sentence: {
    parents: (sentence) => {
      return sentence.getParents()
    },
    children: ({ id }) => {
      return Sentence.relatedQuery('children').for(id)
    },
    author: ({ authorId }) => {
      return User.query().findById(authorId)
    },
  },
  Mutation: {
    addSentenceMutation: async (parent, { content, parentId }, { user }) => {
      if (!user) {
        return null
      }
      return Sentence.query().insert({
        content: content.trim(),
        parentId,
        authorId: user.id,
      })
    },
    deleteSentenceMutation: async (parent, { id }, { user }) => {
      if (!user) {
        return null
      }
      const count = await Sentence.query().delete({ id, authorId: user.id })
      return { success: count > 0 }
    },
  },
}
