import * as fragments from './fragments'

export const addNewStory = (cache, storyParentId, newStory) => {
  const [end, backlink] = newStory.id.split(',')
  const isLink = backlink && end === backlink.split(':')[0]

  const sentenceParentId = storyParentId.split(',')[0]
  const storyParentRegex = new RegExp(`^Story:${sentenceParentId},?`)
  const storyParentIds = Object.keys(cache.data.data)
    .filter((k) => storyParentRegex.test(k))
    .map((k) => k.split('Story:')[1])

  for (const storyId of storyParentIds) {
    const [end, ...backtrace] = storyId.split(',')
    if (isLink) {
      backtrace.unshift(`${newStory.ending.id}:${end}`)
    }
    const id = [newStory.ending.id, ...backtrace].join(',')
    const newStoryRef = cache.writeFragment({
      data: { ...newStory, id, permalink: `/${id}` },
      fragment: fragments.story,
      fragmentName: 'StoryFragment',
    })
    cache.modify({
      id: `Story:${storyId}`,
      fields: {
        childCount(count) {
          return count && count > 0 ? count + 1 : 1
        },
        children(childRefs) {
          return [...childRefs, newStoryRef]
        },
      },
    })
  }
  cache.modify({
    id: 'ROOT_QUERY',
    fields: {
      myStories({ DELETE }) {
        return DELETE
      },
      myLinks({ DELETE }) {
        return DELETE
      },
      otherSentences({ DELETE }) {
        return DELETE
      },
    },
  })
}
