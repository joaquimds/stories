exports.up = (knex) => {
  return knex.schema.createTable('titles', (table) => {
    table.bigIncrements()
    table.text('storyId').unique()
    table.text('title').notNullable()
    table.text('slug').unique()
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('titles')
}
