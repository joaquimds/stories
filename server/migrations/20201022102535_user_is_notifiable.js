exports.up = (knex) => {
  return knex.schema.alterTable('users', (table) => {
    table.boolean('isNotifiable').notNullable().defaultTo(true)
  })
}

exports.down = (knex) => {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('isNotifiable')
  })
}
