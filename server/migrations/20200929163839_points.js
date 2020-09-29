exports.up = (knex) => {
  return knex.schema.createTable('points', (table) => {
    table.bigIncrements()
    table.bigInteger('sentenceId').index().notNullable()
    table.bigInteger('userId').index().notNullable()
    table.bigInteger('parentId').index()
    table.bigInteger('likeId').index()
    table.string('type', 16).notNullable()
    table.unique(['sentenceId', 'userId', 'type'])
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('points')
}
