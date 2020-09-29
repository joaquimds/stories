exports.seed = async (knex) => {
  await knex('likes').truncate()
  await knex('points').truncate()
  await knex('likes').insert([
    { storyId: '3', sentenceId: 3, userId: 1 },
    { storyId: '6', sentenceId: 6, userId: 1 },
    { storyId: '7', sentenceId: 7, userId: 1 },
    { storyId: '8', sentenceId: 8, userId: 1 },
  ])
  await knex('points').insert({
    sentenceId: 1,
    likeId: 1,
    userId: 1,
    type: 'LIKE',
  })
  await knex('points').insert({
    sentenceId: 3,
    likeId: 1,
    userId: 1,
    type: 'LIKE',
  })
  await knex('points').insert({
    sentenceId: 6,
    likeId: 2,
    userId: 1,
    type: 'LIKE',
  })
  await knex('points').insert({
    sentenceId: 7,
    likeId: 3,
    userId: 1,
    type: 'LIKE',
  })
  await knex('points').insert({
    sentenceId: 8,
    likeId: 4,
    userId: 1,
    type: 'LIKE',
  })
}
