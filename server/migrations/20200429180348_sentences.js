exports.up = (knex) => {
  return knex.schema.createTable('sentences', (table) => {
    table.bigIncrements()
    table.text('content').notNullable()
    table.bigInteger('authorId').notNullable()
    table.bigInteger('parentId')
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('sentences')
}
