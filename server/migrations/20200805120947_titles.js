exports.up = (knex) => {
  return knex.schema.createTable('titles', (table) => {
    table.bigIncrements()
    table.string('content').notNullable()
    table.string('slug').notNullable().unique()
    table.bigInteger('sentenceId').notNullable().index()
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('titles')
}
