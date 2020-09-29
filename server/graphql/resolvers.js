import { Like } from '../models/Like'
import { Point } from '../models/Point'
import { Sentence } from '../models/Sentence'
import { SentenceLink } from '../models/SentenceLink'
import { Title } from '../models/Title'
import { User } from '../models/User'
import { logger } from '../services/logger'
import { slugify } from '../util/text'
import { addThreadStep, parseThread, printThread } from '../util/threads'

const LIMIT = 3

export const resolvers = {
  Query: {
    story: async (parent, { slug }) => {
      if (!slug) {
        slug = '0'
      }

      const title = await Title.query().findOne({ slug })
      const id = title ? title.storyId : slug

      const thread = parseThread(id)

      const ending = await Sentence.query().findOne({ id: thread.end })
      if (!ending) {
        return null
      }

      return {
        id: printThread(thread),
        ending,
        thread,
        title: title?.title,
        slug: title?.slug,
      }
    },
    stories: async (parent, { search, order, offset = 0 }) => {
      const query = Sentence.query().join(
        'titles',
        'sentences.id',
        'titles.sentenceId'
      )
      if (search) {
        const escapedSearch = search.replace(/%/g, '\\%')
        query.where('title', 'ilike', `%${escapedSearch}%`)
      }
      const countResult = await query.clone().count().first()
      Sentence.addOrder(query, order)
      const sentences = await query
        .select('sentences.*', 'titles.storyId')
        .limit(LIMIT)
        .offset(offset)
      const stories = sentences.map((sentence) => {
        return {
          id: sentence.storyId,
          ending: sentence,
          thread: parseThread(sentence.storyId),
        }
      })
      return { count: countResult.count, stories }
    },
    myStories: async (parent, { search, offset = 0 }, { user }) => {
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
      const stories = sentences.map((sentence) => {
        const thread = sentence.getThread()
        return {
          id: printThread(thread),
          ending: sentence,
          thread,
        }
      })
      return { count: countResult.count, stories }
    },
    likedStories: async (parent, { search, offset = 0 }, { user }) => {
      if (!user) {
        return []
      }
      const query = Sentence.query()
        .join('likes', 'sentences.id', 'likes.sentenceId')
        .whereNotNull('content')
      if (search) {
        const escapedSearch = search.replace(/%/g, '\\%')
        query.andWhere('content', 'ilike', `%${escapedSearch}%`)
      }
      const countResult = await query.clone().count().first()
      const sentences = await query
        .select('sentences.*', 'likes.storyId')
        .orderBy('likes.id', 'desc')
        .offset(offset)
        .limit(LIMIT)
      const stories = sentences.map((sentence) => {
        return {
          id: sentence.storyId,
          ending: sentence,
          thread: parseThread(sentence.storyId),
        }
      })
      return {
        count: countResult.count,
        stories,
      }
    },
  },
  Story: {
    intro: async ({ ending, thread }) => {
      if (ending.id === '0') {
        return ''
      }
      const parents = await ending.getParents(thread)
      const firstParent = parents.filter(
        ({ ending: { content, authorId } }) => {
          return content && authorId
        }
      )[0]
      return firstParent ? firstParent.ending.content : ending.content
    },
    title: async ({ id, title }) => {
      if (title) {
        return title
      }
      const titleEntity = await Title.query().findOne({ storyId: id })
      return titleEntity?.title
    },
    permalink: async ({ id, slug }) => {
      if (slug) {
        return `/${slug}`
      }
      const titleEntity = await Title.query().findOne({ storyId: id })
      return titleEntity ? `/${titleEntity.slug}` : `/${id}`
    },
    parents: async ({ ending, thread }) => {
      if (ending.id === '0') {
        return []
      }
      return ending.getParents(thread)
    },
    childCount: ({ ending }) => {
      return ending.countChildren()
    },
    children: async ({ ending, thread }, { order, exclude }) => {
      const children = await ending.getChildren(order, exclude, LIMIT)
      return children.map((c) => {
        if (c.defaultParent !== ending.id) {
          thread = addThreadStep(thread, c.id, ending.id)
        }
        thread.end = c.id
        const id = printThread(thread)
        return { id, thread, ending: c }
      })
    },
    liked: async ({ id }, args, { user }) => {
      if (!user || !id) {
        return false
      }
      const like = await Like.query().findOne({
        storyId: id,
        userId: user.id,
      })
      return Boolean(like)
    },
  },
  Sentence: {
    content: ({ id, content, authorId }) => {
      if (id === '0') {
        return ''
      }
      return authorId ? content : '[deleted]'
    },
    author: ({ authorId }) => {
      return authorId ? User.query().findById(authorId) : null
    },
  },
  Mutation: {
    addSentenceMutation: async (parent, args, { user }) => {
      try {
        const content = args.content.trim().substring(0, 240)
        const parentId = args.parentId
        if (!user || !content || !parentId) {
          return { errorCode: 400 }
        }
        const parentThread = parseThread(parentId)
        const ending = await Sentence.query().insert({
          content,
          storyParentId: parentId,
          authorId: user.id,
        })
        await SentenceLink.query().insert({
          from: parentThread.end,
          to: ending.id,
        })
        const thread = ending.getThread()
        await ending.createPoints(thread, {
          userId: user.id,
          parentId: ending.id,
        })
        return { story: { id: printThread(thread), thread, ending } }
      } catch (e) {
        logger.error('%s %o %o', 'addSentenceMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
    saveStoryMutation: async (parent, args, { user }) => {
      const { id, title } = args
      const isThread = /^[0-9,:]+$/.test(title)
      if (isThread) {
        return { errorCode: 400 }
      }
      if (!user) {
        return { errorCode: 403 }
      }
      const authorId = user.id
      try {
        const thread = parseThread(id)
        const sentence = await Sentence.query().findById(thread.end)
        if (!sentence) {
          return { errorCode: 404 }
        }
        if (sentence.authorId !== authorId) {
          return { errorCode: 403 }
        }
        const slug = slugify(title)
        const existing = await Title.query().findOne({ slug })
        if (existing) {
          return { errorCode: 409 }
        }
        await Title.query().insert({
          storyId: id,
          sentenceId: sentence.id,
          title,
          slug,
        })
        return { slug }
      } catch (e) {
        logger.error('%s %o %o', 'saveStoryMutation', args, e.message)
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
        await Point.query().delete().where({ parentId: sentence.id })
        const likes = await Like.query().where({ sentenceId: sentence.id })
        const likeIds = likes.map((l) => l.id)
        await Point.query().delete().whereIn('likeId', likeIds)
        await Like.query().delete().whereIn('id', likeIds)
        if (sentence.children.length) {
          const updated = await Sentence.query().patchAndFetchById(id, {
            authorId: null,
          })
          return { sentence: updated }
        }
        await SentenceLink.query().delete().where({ to: id })
        await Sentence.query().deleteById(id)
        return {}
      } catch (e) {
        logger.error('%s %o %o', 'deleteSentenceMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
    likeStoryMutation: async (parent, args, { user }) => {
      const { id, like: isLike } = args
      if (!user) {
        return { errorCode: 403 }
      }
      const thread = parseThread(id)
      try {
        const sentence = await Sentence.query().findById(thread.end)
        if (!sentence) {
          return { errorCode: 404 }
        }
        const queryArgs = { storyId: id, userId: user.id }
        if (!isLike) {
          const like = await Like.query().findOne(queryArgs)
          if (like) {
            await Point.query().delete().where({ likeId: like.id })
          }
          await Like.query().where(queryArgs).delete()
          return {}
        }
        const existing = await Like.query().findOne(queryArgs)
        if (existing) {
          return {}
        }
        const like = await Like.query().insert({
          ...queryArgs,
          sentenceId: sentence.id,
        })
        await sentence.createPoints(thread, {
          likeId: like.id,
          userId: user.id,
        })
        return {}
      } catch (e) {
        logger.error('%s %o %o', 'likeStoryMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
  },
}
