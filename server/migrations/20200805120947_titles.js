exports.up = (knex) => {
  return knex.schema.createTable('titles', (table) => {
    table.bigIncrements()
    table.text('content').notNullable()
    table.text('slug').notNullable().unique()
    table.bigInteger('sentenceId').notNullable().index()
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('sentences')
}
