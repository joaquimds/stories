exports.up = (knex) => {
  return knex.schema.createTable('users', (table) => {
    table.bigIncrements()
    table.string('email').unique().notNullable()
    table.string('name').notNullable()
    table.string('passwordHash').notNullable()
  })
}

exports.down = (knex) => {
  return knex.schema.dropTable('users')
}
