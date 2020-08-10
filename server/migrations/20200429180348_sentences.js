exports.up = (knex) => {
  return knex.schema.createTable('sentences', (table) => {
    table.bigIncrements()
    table.text('content').notNullable()
    table.text('title')
    table.text('slug').unique()
    table.bigInteger('authorId')
    table.bigInteger('parentId')
    table.dateTime('date').defaultTo(knex.fn.now())
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('sentences')
}
