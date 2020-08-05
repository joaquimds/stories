import { Sentence } from '../models/Sentence'
import { User } from '../models/User'

export const resolvers = {
  Query: {
    sentence: (parent, { id }) => {
      return id === 'root' ? { id } : Sentence.query().findById(id)
    },
  },
  Sentence: {
    content: ({ id, content, authorId }) => {
      if (id === 'root') {
        return ''
      }
      return authorId ? content : '[deleted]'
    },
    parents: async (sentence) => {
      if (sentence.id === 'root') {
        return []
      }
      const parents = await sentence.getParents()
      return [{ id: 'root' }, ...parents]
    },
    childCount: (sentence) => {
      const id = sentence.id === 'root' ? null : sentence.id
      return Sentence.countChildren(id)
    },
    children: (sentence, { order, offset, exclude }) => {
      const id = sentence.id === 'root' ? null : sentence.id
      return Sentence.getChildren(id, order, offset, exclude)
    },
    author: ({ authorId }) => {
      return authorId ? User.query().findById(authorId) : null
    },
  },
  Mutation: {
    addSentenceMutation: async (parent, args, { user }) => {
      const content = args.content.trim()
      const parentId = args.parentId === 'root' ? null : args.parentId
      if (!user || !content) {
        return null
      }
      return Sentence.query().insert({
        content,
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
