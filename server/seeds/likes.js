exports.seed = async (knex) => {
  await knex('likes').truncate()
  await knex('likes').insert([
    { sentenceId: 4, userId: 1 },
    { sentenceId: 5, userId: 1 },
  ])
}
