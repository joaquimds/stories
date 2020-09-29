exports.up = (knex) => {
  return knex.schema.createTable('titles', (table) => {
    table.bigIncrements()
    table.text('storyId').unique().notNullable()
    table.bigInteger('sentenceId').notNullable()
    table.text('title').notNullable()
    table.text('slug').unique().notNullable()
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('titles')
}
