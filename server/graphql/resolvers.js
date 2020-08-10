import { raw } from 'objection'
import { Sentence } from '../models/Sentence'
import { User } from '../models/User'
import { logger } from '../services/logger'
import { slugify } from '../util/text'

export const resolvers = {
  Query: {
    sentence: async (parent, { slug }) => {
      if (!slug) {
        return { id: null }
      }

      const sentence = await Sentence.query().findOne({ slug })
      if (sentence) {
        return sentence
      }

      const isInteger = /^[0-9]+$/.test(slug)
      if (isInteger) {
        return Sentence.query().findById(slug)
      }

      return null
    },
    stories: async (parent, { search }) => {
      const limit = 100
      if (!search) {
        return Sentence.query().whereNotNull('title').limit(limit)
      }
      return Sentence.query()
        .with('t', raw('select plainto_tsquery(?) as q', search))
        .whereRaw('numnode(q) > 0')
        .andWhereRaw(
          "to_tsvector('english', title) @@ to_tsquery(q::text || ':*')"
        )
        .from(raw('sentences,t'))
    },
  },
  Sentence: {
    content: ({ id, content, authorId }) => {
      if (!id) {
        return ''
      }
      return authorId ? content : '[deleted]'
    },
    parents: async (sentence) => {
      if (!sentence.id) {
        return []
      }
      const parents = await sentence.getParents()
      return [{ id: null }, ...parents]
    },
    childCount: (sentence) => {
      return Sentence.countChildren(sentence.id)
    },
    children: (sentence, { order, offset, exclude }) => {
      return Sentence.getChildren(sentence.id, order, offset, exclude)
    },
    author: ({ authorId }) => {
      return authorId ? User.query().findById(authorId) : null
    },
  },
  Mutation: {
    addSentenceMutation: async (parent, args, { user }) => {
      try {
        const content = args.content.trim()
        const parentId = args.parentId
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
    saveSentenceMutation: async (parent, args, { user }) => {
      const { id, title } = args
      if (!user) {
        return { errorCode: 403 }
      }
      const authorId = user.id
      try {
        const sentence = await Sentence.query().findById(id)
        if (!sentence) {
          return { errorCode: 404 }
        }
        if (sentence.authorId !== authorId) {
          return { errorCode: 403 }
        }
        const slug = slugify(title)
        const existing = await Sentence.query().findOne({ slug })
        if (existing) {
          return { errorCode: 409 }
        }
        await Sentence.query().patchAndFetchById(id, {
          slug,
          title,
        })
        return { slug }
      } catch (e) {
        logger.error('%s %o %o', 'saveSentenceMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
    deleteSentenceMutation: async (parent, args, { user }) => {
      const { id } = args
      if (!user) {
        return { errorCode: 403 }
      }
      const authorId = user.id
      try {
        const sentence = await Sentence.query()
          .findById(id)
          .withGraphFetched('children')
        if (!sentence) {
          return { errorCode: 404 }
        }
        if (sentence.authorId !== authorId) {
          return { errorCode: 403 }
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
