import { Sentence } from '../models/Sentence'
import { Title } from '../models/Title'
import { User } from '../models/User'
import { logger } from '../services/logger'
import { slugify } from '../util/text'

export const resolvers = {
  Query: {
    sentence: async (parent, { slug }) => {
      if (!slug) {
        return { id: 'root' }
      }

      const title = await Title.query()
        .where({ slug })
        .withGraphFetched('sentence')
        .first()
      if (title && title.sentence) {
        const { sentence } = title
        sentence.title = title.content
        sentence.slug = title.slug
        return sentence
      }

      const isInteger = /^[0-9]+$/.test(slug)
      if (isInteger) {
        return Sentence.query().findById(slug)
      }

      return null
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
      const databaseId = sentence.id === 'root' ? null : sentence.id
      return Sentence.countChildren(databaseId)
    },
    children: (sentence, { order, offset, exclude }) => {
      const databaseId = sentence.id === 'root' ? null : sentence.id
      return Sentence.getChildren(databaseId, order, offset, exclude)
    },
    author: ({ authorId }) => {
      return authorId ? User.query().findById(authorId) : null
    },
  },
  Mutation: {
    addSentenceMutation: async (parent, args, { user }) => {
      try {
        const content = args.content.trim()
        const parentId = args.parentId === 'root' ? null : args.parentId
        if (!user || !content) {
          return { errorCode: 400 }
        }
        const sentence = await Sentence.query().insert({
          content,
          parentId,
          authorId: user.id,
        })
        return { sentence }
      } catch (e) {
        logger.error('%s %o %o', 'addSentenceMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
    saveSentenceMutation: async (parent, args) => {
      const { id, title } = args
      try {
        const sentence = await Sentence.query().findById(id)
        if (!sentence) {
          return { errorCode: 404 }
        }
        const slug = slugify(title)
        const existingTitle = await Title.query().where({ slug }).first()
        if (existingTitle) {
          return { errorCode: 409 }
        }
        await Title.query().insertAndFetch({
          slug,
          content: title,
          sentenceId: sentence.id,
        })
        return { slug }
      } catch (e) {
        logger.error('%s %o %o', 'saveSentenceMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
    deleteSentenceMutation: async (parent, args, { user }) => {
      const { id } = args
      try {
        if (!user) {
          return { errorCode: 400 }
        }
        const sentence = await Sentence.query()
          .findById(id)
          .withGraphFetched('children')
        if (!sentence) {
          return { errorCode: 404 }
        }
        if (sentence.children.length) {
          const updated = await Sentence.query().patchAndFetchById(id, {
            authorId: null,
          })
          return { sentence: updated }
        }
        await Sentence.query().deleteById(id)
        return {}
      } catch (e) {
        logger.error('%s %o %o', 'deleteSentenceMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
  },
}
