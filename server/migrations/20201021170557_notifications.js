exports.up = (knex) => {
  return knex.schema.createTable('notifications', (table) => {
    table.bigIncrements()
    table.bigInteger('userId').index().notNullable()
    table.json('data').notNullable()
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('notifications')
}
