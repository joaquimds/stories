exports.up = (knex) => {
  return knex.schema.createTable('points', (table) => {
    table.bigIncrements()
    table.bigInteger('sentenceId').index().notNullable()
    table.text('storyParentId').notNullable()
    table.bigInteger('userId').index().notNullable()
    table.bigInteger('sourceId').index().notNullable()
    table.string('type', 16).notNullable()
    table.unique(['sentenceId', 'storyParentId', 'userId', 'type'])
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('points')
}
