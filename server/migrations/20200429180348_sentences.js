exports.up = (knex) => {
  return knex.schema
    .createTable('sentences', (table) => {
      table.bigIncrements()
      table.text('storyParentId').notNullable()
      table.text('content').notNullable()
      table.bigInteger('authorId').index()
      table.dateTime('date').defaultTo(knex.fn.now())
    })
    .createTable('sentenceLinks', (table) => {
      table.bigIncrements()
      table.bigInteger('from').index().notNullable()
      table.bigInteger('to').index().notNullable()
      table.bigInteger('authorId').index()
      table.boolean('deleted').defaultTo(false).notNullable()
      table.unique(['from', 'to'])
    })
}

exports.down = (knex) => {
  return knex.schema.dropTable('sentenceLinks').dropTable('sentences')
}
