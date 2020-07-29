exports.up = (knex) => {
  return knex.schema.createTable('users', (table) => {
    table.bigIncrements()
    table.string('username').unique().notNullable()
    table.string('passwordHash').notNullable()
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('users')
}
