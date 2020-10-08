import { raw, ref } from 'objection'
import { Like } from '../models/Like'
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
      let subquery
      switch (order) {
        case 'newest':
          query.orderBy('id', 'desc')
          break
        case 'oldest':
          query.orderBy('id', 'asc')
          break
        case 'score':
        default:
          subquery = Like.query()
            .count()
            .as('score')
            .where({ storyId: ref('titles.storyId') })
          query.select(subquery)
          query.orderBy('score', 'desc')
          query.orderBy('id', 'asc')
          break
      }
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
      const sentences = await query
        .orderBy('id', 'asc')
        .offset(offset)
        .limit(LIMIT)
      const stories = sentences.map((sentence) => {
        const thread = sentence.getCreatedThread()
        return {
          id: printThread(thread),
          ending: sentence,
          thread,
        }
      })
      return { count: countResult.count, stories }
    },
    myLinks: async (parent, { search, offset = 0 }, { user }) => {
      if (!user) {
        return null
      }
      const query = Sentence.query()
        .from(raw('sentences sf'))
        .join('sentenceLinks', 'sf.id', 'sentenceLinks.from')
        .join(raw('sentences st'), 'st.id', 'sentenceLinks.to')
        .where('sentenceLinks.authorId', '=', user.id)
      if (search) {
        const escapedSearch = search.replace(/%/g, '\\%')
        query.andWhere((queryBuilder) => {
          queryBuilder
            .where(ref('sf.content'), 'ilike', `%${escapedSearch}%`)
            .orWhere(ref('st.content'), 'ilike', `%${escapedSearch}%`)
        })
      }
      const countResult = await query.clone().count().first()
      const sentences = await query
        .select('st.*', 'sentenceLinks.from', 'sentenceLinks.to')
        .orderBy('sentenceLinks.id', 'asc')
        .offset(offset)
        .limit(LIMIT)
      const stories = sentences.map((sentence) => {
        const thread = {
          end: sentence.id,
          backtrace: [{ from: sentence.to, to: sentence.from }],
        }
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
        .leftOuterJoin('titles', 'sentences.id', 'titles.sentenceId')
        .whereNotNull('content')
      if (search) {
        const escapedSearch = search.replace(/%/g, '\\%')
        query.andWhere('title', 'ilike', `%${escapedSearch}%`)
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
    otherSentences: async (p, { from, direction, search, offset = 0 }) => {
      const thread = parseThread(from)
      if (search) {
        const query = Sentence.query().whereNot({ id: '0' })
        const escapedSearch = search.replace(/%/g, '\\%')
        query.andWhere('content', 'ilike', `%${escapedSearch}%`)
        const countResult = await query.clone().count().first()
        const sentences = await query
          .orderBy('id', 'asc')
          .offset(offset)
          .limit(LIMIT)
        return {
          count: countResult.count,
          sentences,
        }
      }
      let query
      switch (direction) {
        case 'parents':
          query = Sentence.query()
            .join('sentenceLinks as sl1', 'sentences.id', 'sl1.to')
            .join('sentenceLinks as sl2', 'sl1.from', 'sl2.from')
            .join('sentenceLinks as sl3', 'sl2.to', 'sl3.from')
            .where('sentences.id', '!=', '0')
            .andWhere('sl3.to', '=', thread.end)
          break
        case 'children':
          query = Sentence.query()
            .join('sentenceLinks as sl1', 'sentences.id', 'sl1.to')
            .join('sentenceLinks as sl2', 'sl1.from', 'sl2.from')
            .join('sentenceLinks as sl3', 'sl2.to', 'sl3.to')
            .where('sentences.id', '!=', '0')
            .andWhere('sl3.from', '=', thread.end)
          break
        case 'siblings':
        default:
          query = Sentence.query()
            .join('sentenceLinks as sl1', 'sentences.id', 'sl1.to')
            .join('sentenceLinks as sl2', 'sl1.from', 'sl2.from')
            .where('sentences.id', '!=', '0')
            .andWhere('sl2.to', '=', thread.end)
          break
      }
      const countResult = await query
        .clone()
        .countDistinct('sentences.id')
        .first()
      const sentences = await query
        .distinct('sentences.*')
        .orderBy('sentences.id', 'asc')
        .offset(offset)
        .limit(LIMIT)
      return {
        count: countResult.count,
        sentences,
      }
    },
  },
  Story: {
    title: async ({ id, title }) => {
      if (title) {
        return title
      }
      const titleEntity = await Title.query().findOne({ storyId: id })
      return titleEntity?.title
    },
    permalink: async ({ id, slug }, args, { dataLoaders }) => {
      if (slug) {
        return `/${slug}`
      }
      const titleEntity = await dataLoaders.titleLoader.load(id)
      return titleEntity ? `/${titleEntity.slug}` : `/${id}`
    },
    parent: async ({ ending, thread }) => {
      if (ending.id === '0') {
        return null
      }
      return ending.getParent(thread)
    },
    keySentences: async ({ ending, thread }, { limit }) => {
      if (ending.id === '0') {
        return []
      }
      const allParents = await ending.getParents(thread)
      const validParents = allParents
        .map(({ ending }) => ending)
        .filter(({ content, authorId }) => content && authorId)
      let keySentences = validParents.length ? [validParents.shift()] : []
      keySentences = keySentences.concat(
        thread.backtrace.map(({ to }) =>
          validParents.find(({ id }) => to === id)
        )
      )
      keySentences.push(ending)
      if (limit) {
        return keySentences.slice(0, limit)
      }
      return keySentences
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
    children: async ({ id, ending, thread }, { order, exclude }) => {
      const children = await ending.getChildren(id, order, exclude, LIMIT)
      return children.map((c) => {
        const childThread = addThreadStep(
          thread,
          c.id,
          ending.id,
          c.defaultParent
        )
        const id = printThread(childThread)
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
    linkAuthor: async ({ id, thread }) => {
      const { end, backtrace } = thread
      if (backtrace.length && end === backtrace[0].from) {
        const backlink = backtrace[0]
        const sentenceLink = await SentenceLink.query()
          .where({
            from: backlink.to,
            to: backlink.from,
          })
          .andWhereNot({ authorId: null })
          .first()
        if (sentenceLink) {
          const isProtected = await sentenceLink.isProtected(id)
          if (!isProtected) {
            return User.query().findById(sentenceLink.authorId)
          }
        }
      }
      return null
    },
  },
  Sentence: {
    content: ({ id, content, authorId }) => {
      if (id === '0') {
        return ''
      }
      return authorId ? content : '[deleted]'
    },
    author: (sentence, args, ctx) => {
      const { authorId } = sentence
      return authorId ? ctx.dataLoaders.userLoader.load(authorId) : null
    },
    hasChild: ({ id }, args, ctx) => {
      return ctx.dataLoaders.hasChildLoader.load(id)
    },
    hasParent: ({ id }, args, ctx) => {
      return ctx.dataLoaders.hasParentLoader.load(id)
    },
  },
  Mutation: {
    addSentenceMutation: async (parent, args, { user }) => {
      if (!user) {
        return { errorCode: 403 }
      }
      try {
        const content = args.content.trim().substring(0, 240)
        const parentId = args.parentId
        if (!content || !parentId) {
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
          authorId: user.id,
        })
        const thread = ending.getCreatedThread()
        await ending.createPoints(thread, user.id, 'WRITE')
        return { story: { id: printThread(thread), thread, ending } }
      } catch (e) {
        logger.error('%s %o %o', 'addSentenceMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
    linkSentenceMutation: async (parent, { childId, parentId }, { user }) => {
      try {
        if (!user || !childId || !parentId) {
          return { errorCode: 400 }
        }
        const parentThread = parseThread(parentId)
        const parentSentence = await Sentence.query().findOne({
          id: parentThread.end,
        })
        const ending = await Sentence.query().findOne({
          id: childId,
        })
        if (!parentSentence || !ending) {
          return { errorCode: 404 }
        }
        const existingLink = await SentenceLink.query().findOne({
          from: parentSentence.id,
          to: ending.id,
        })
        let newLink = null
        if (!existingLink) {
          newLink = await SentenceLink.query().insert({
            from: parentSentence.id,
            to: ending.id,
            authorId: user.id,
          })
        }
        const defaultLink = await SentenceLink.query()
          .findOne({
            to: ending.id,
          })
          .orderBy('id', 'asc')
        const thread = addThreadStep(
          parentThread,
          ending.id,
          parentSentence.id,
          defaultLink.from
        )
        const id = printThread(thread)
        if (!newLink) {
          return { id }
        }
        return { id, newStory: { id, thread, ending } }
      } catch (e) {
        logger.error(
          '%s %o %o',
          'linkSentenceMutation',
          { parentId, childId },
          e.message
        )
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
        await Title.query().delete().where({ storyId: id })
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
      try {
        const sentence = await Sentence.query()
          .findById(id)
          .withGraphFetched('children')
        if (!sentence) {
          return { errorCode: 404 }
        }
        if (sentence.authorId !== user.id) {
          return { errorCode: 403 }
        }
        await sentence.removePoints(sentence.getCreatedThread(), 'WRITE', [
          user.id,
        ])
        const likes = await Like.query().where({ sentenceId: sentence.id })
        const likeIds = []
        const storyIds = {}
        for (const like of likes) {
          likeIds.push(like.id)
          const userIds = storyIds[like.storyId] || []
          userIds.push(like.userId)
          storyIds[like.storyId] = userIds
        }
        for (const storyId of Object.keys(storyIds)) {
          await sentence.removePoints(
            parseThread(storyId),
            'LIKE',
            storyIds[storyId]
          )
        }
        if (sentence.children.length) {
          const updated = await Sentence.query().patchAndFetchById(id, {
            authorId: null,
          })
          return { sentence: updated }
        }
        await Like.query().delete().whereIn('id', likeIds)
        await Title.query().delete().where({ sentenceId: id })
        await SentenceLink.query().delete().where({ to: id })
        await Sentence.query().deleteById(id)
        return {}
      } catch (e) {
        logger.error('%s %o %o', 'deleteSentenceMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
    unlinkSentenceMutation: async (parent, args, { user }) => {
      const { id } = args
      if (!user) {
        return { errorCode: 403 }
      }
      const { end, backtrace } = parseThread(id)
      if (!backtrace.length || end !== backtrace[0].from) {
        return { errorCode: 400 }
      }
      const backlink = backtrace[0]
      const sentenceLink = await SentenceLink.query().findOne({
        from: backlink.to,
        to: backlink.from,
      })
      if (!sentenceLink) {
        return { errorCode: 400 }
      }
      if (sentenceLink.authorId !== user.id) {
        return { errorCode: 403 }
      }
      const isProtected = await sentenceLink.isProtected(id)
      if (isProtected) {
        return { errorCode: 403 }
      }
      try {
        const likes = await Like.query()
          .where('storyId', 'like', `%,${backlink.from}:${backlink.to}%`)
          .andWhere('storyId', '~', `,${backlink.from}:${backlink.to}(,.*)?$`)
          .withGraphFetched('sentence')
        for (const like of likes) {
          await like.sentence.removePoints(parseThread(like.storyId), 'LIKE', [
            like.userId,
          ])
          await Like.query().deleteById(like.id)
        }
        await SentenceLink.query().deleteById(sentenceLink.id)
        return {}
      } catch (e) {
        logger.error('%s %o %o', 'unlinkSentenceMutation', args, e.message)
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
          const like = await Like.query()
            .findOne(queryArgs)
            .withGraphFetched('sentence')
          if (like) {
            await like.sentence.removePoints(parseThread(id), 'LIKE', [user.id])
          }
          await Like.query().where(queryArgs).delete()
          return {}
        }
        const existing = await Like.query().findOne(queryArgs)
        if (existing) {
          return {}
        }
        await Like.query().insert({
          ...queryArgs,
          sentenceId: sentence.id,
        })
        await sentence.createPoints(thread, user.id, 'LIKE')
        return {}
      } catch (e) {
        logger.error('%s %o %o', 'likeStoryMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
    editStoryMutation: async (parent, args, { user }) => {
      if (!user) {
        return { errorCode: 403 }
      }
      try {
        const content = args.content.trim().substring(0, 240)
        const storyId = args.id
        const editedId = args.editedId
        if (!content || !storyId || !editedId) {
          return { errorCode: 400 }
        }
        const prevThread = parseThread(storyId)
        const sentence = await Sentence.query().findById(prevThread.end)
        if (!sentence) {
          return { errorCode: 404 }
        }
        const parents = await sentence.getParents(prevThread)
        const storyIds = parents.map((p) => p.id)
        storyIds.push(storyId)
        let parentId
        let childId
        let restIds
        for (let i = 0; i < storyIds.length; ++i) {
          if (storyIds[i] === editedId) {
            parentId = storyIds[i - 1]
            childId = storyIds[i]
            restIds = storyIds.slice(i + 1)
            break
          }
        }
        const newChild = await Sentence.query().insert({
          content,
          storyParentId: parentId,
          authorId: user.id,
        })
        const parentThread = parseThread(parentId)
        await SentenceLink.query().insert({
          from: parentThread.end,
          to: newChild.id,
          authorId: user.id,
        })
        const childThread = parseThread(childId)
        const prevLinks = await SentenceLink.query().where({
          from: childThread.end,
        })
        await SentenceLink.query().insert(
          prevLinks.map((link) => ({
            from: newChild.id,
            to: link.to,
            authorId: user.id,
          }))
        )
        let thread = newChild.getCreatedThread()
        await newChild.createPoints(thread, user.id, 'WRITE')
        const newChildId = printThread(thread)

        const response = {
          newStory: { id: newChildId, thread, ending: newChild },
        }

        // Add backlink to new child
        if (restIds.length) {
          const nextId = restIds.shift()
          const nextThread = parseThread(nextId)
          thread = addThreadStep(thread, nextThread.end, newChild.id)
        }
        // Copy across the rest of the thread
        while (restIds.length) {
          const nextId = restIds.shift()
          const nextThread = parseThread(nextId)
          const [backlink] = nextThread.backtrace
          if (backlink && backlink.from === nextThread.end) {
            thread = addThreadStep(thread, nextThread.end, thread.end)
          } else {
            thread = { ...thread, end: nextThread.end }
          }
        }

        response.storyParentId = parentId
        response.completeStoryId = printThread(thread)
        return response
      } catch (e) {
        logger.error('%s %o %o', 'editStoryMutation', args, e.message)
        return { errorCode: 500 }
      }
    },
  },
}
