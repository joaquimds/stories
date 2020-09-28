exports.seed = async (knex) => {
  await knex('likes').truncate()
  await knex('likes').insert([
    { storyId: '3', userId: 1 },
    { storyId: '6', userId: 1 },
    { storyId: '7', userId: 1 },
    { storyId: '8', userId: 1 },
  ])
}
