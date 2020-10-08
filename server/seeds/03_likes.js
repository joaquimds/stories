exports.seed = async (knex) => {
  await knex('likes').truncate()
  await knex('likes').insert([
    { storyId: '3', sentenceId: 3, userId: 1 },
    { storyId: '6', sentenceId: 6, userId: 1 },
    { storyId: '6,6:4', sentenceId: 6, userId: 1 },
    { storyId: '7', sentenceId: 7, userId: 1 },
    { storyId: '8', sentenceId: 8, userId: 1 },
  ])
  await knex('points').insert({
    sentenceId: 1,
    storyParentId: '0',
    count: 5,
    userId: 1,
    type: 'LIKE',
  })
  await knex('points').insert({
    sentenceId: 3,
    storyParentId: '1',
    count: 4,
    userId: 1,
    type: 'LIKE',
  })
  await knex('points').insert({
    sentenceId: 6,
    storyParentId: '3',
    count: 3,
    userId: 1,
    type: 'LIKE',
  })
  await knex('points').insert({
    sentenceId: 4,
    storyParentId: '1',
    count: 1,
    userId: 1,
    type: 'LIKE',
  })
  await knex('points').insert({
    sentenceId: 6,
    storyParentId: '4',
    count: 1,
    userId: 1,
    type: 'LIKE',
  })
  await knex('points').insert({
    sentenceId: 7,
    storyParentId: '6',
    count: 2,
    userId: 1,
    type: 'LIKE',
  })
  await knex('points').insert({
    sentenceId: 8,
    storyParentId: '7',
    count: 1,
    userId: 1,
    type: 'LIKE',
  })
}
