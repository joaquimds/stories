exports.seed = async (knex) => {
  await knex('sentences').del()
  await knex('sentences').insert([
    {
      content: 'Once upon a time,',
      authorId: 1,
    },
    {
      content: 'in a land far away,',
      authorId: 1,
      parentId: 1,
    },
  ])
}
