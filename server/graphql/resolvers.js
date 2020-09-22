import { Like } from '../models/Like'
import { Sentence } from '../models/Sentence'
import { User } from '../models/User'
import { logger } from '../services/logger'
import { slugify } from '../util/text'

const LIMIT = 3

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
    stories: async (parent, { search, order, exclude = [] }) => {
      const query = Sentence.query().whereNotNull('title')
      if (search) {
        const escapedSearch = search.replace(/%/g, '\\%')
        query.andWhere('title', 'ilike', `%${escapedSearch}%`)
      }
      const countResult = await query.clone().count().first()
      Sentence.addOrder(query, order)
      const sentences = await query
        .andWhere((builder) => builder.whereNotIn('id', exclude))
        .limit(LIMIT)
      return { count: countResult.count, sentences }
    },
    mySentences: async (parent, { search, offset = 0 }, { user }) => {
      if (!user) {
        return []
      }
      const query = Sentence.query().where({ authorId: user.id })
      if (search) {
        const escapedSearch = search.replace(/%/g, '\\%')
        query.andWhere('content', 'ilike', `%${escapedSearch}%`)
      }
      const countResult = await query.clone().count().first()
      const sentences = await query.offset(offset).limit(LIMIT)
      return { count: countResult.count, sentences }
    },
    likedSentences: async (parent, { search, offset = 0 }, { user }) => {
      if (!user) {
        return []
      }
      const subquery = Like.query().where({ userId: user.id })
      const query = Like.relatedQuery('sentence')
        .for(subquery)
        .whereNotNull('content')
      if (search) {
        const escapedSearch = search.replace(/%/g, '\\%')
        query.andWhere('content', 'ilike', `%${escapedSearch}%`)
      }
      const countResult = await query.clone().count().first()
      const sentences = await query.offset(offset).limit(LIMIT)
      return {
        count: countResult.count,
        sentences,
      }
    },
  },
  Sentence: {
    content: ({ id, content, authorId }) => {
      if (!id) {
        return ''
      }
      return authorId ? content : '[deleted]'
    },
    intro: async (sentence) => {
      if (!sentence.id) {
        return ''
      }
      const parents = await sentence.getParents()
      const firstParent = parents.filter(({ content, authorId }) => {
        return content && authorId
      })[0]
      return firstParent ? firstParent.content : sentence.content
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
    children: (sentence, { order, exclude }) => {
      return Sentence.getChildren(sentence.id, order, exclude, LIMIT)
    },
    author: ({ authorId }) => {
      return authorId ? User.query().findById(authorId) : null
    },
    liked: async ({ id }, args, { user }) => {
      if (!user || !id) {
        return false
      }
      const like = await Like.query().findOne({
        sentenceId: id,
        userId: user.id,
      })
      return Boolean(like)
    },
  },
  Mutation: {
    addSentenceMutation: async (parent, args, { user }) => {
      try {
        const content = args.content.trim().substring(0, 240)
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
      const isInteger = /^[0-9]+$/.test(title)
      if (isInteger) {
        return { errorCode: 400 }
      }
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
    likeSentenceMutation: async (parent, args, { user }) => {
      const { id, like } = args
      if (!user) {
        return { errorCode: 403 }
      }
      try {
        const sentence = await Sentence.query().findById(id)
        if (!sentence) {
          return { errorCode: 404 }
        }
        const queryArgs = { sentenceId: id, userId: user.id }
        if (like) {
          const existing = await Like.query().findOne(queryArgs)
          if (existing) {
            return {}
          }
          await Like.query().insert(queryArgs)
          return {}
        }
        await Like.query().delete().where(queryArgs)
        return {}
      } catch (e) {
        logger.error('%s %o %o', 'likeSentenceMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
  },
}
