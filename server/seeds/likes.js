exports.seed = async (knex) => {
  await knex('likes').truncate()
  await knex('likes').insert([
    { sentenceId: 3, userId: 1 },
    { sentenceId: 6, userId: 1 },
    { sentenceId: 7, userId: 1 },
    { sentenceId: 8, userId: 1 },
  ])
}
