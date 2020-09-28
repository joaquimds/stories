exports.up = (knex) => {
  return knex.schema.createTable('likes', (table) => {
    table.bigIncrements()
    table.text('storyId').index().notNullable()
    table.bigInteger('userId').index().notNullable()
    table.unique(['storyId', 'userId'])
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('likes')
}
