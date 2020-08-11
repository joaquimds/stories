exports.up = (knex) => {
  return knex.schema.createTable('likes', (table) => {
    table.bigIncrements()
    table.bigInteger('sentenceId').notNullable()
    table.bigInteger('userId').notNullable()
    table.unique(['sentenceId', 'userId'])
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('likes')
}
