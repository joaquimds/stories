exports.up = async (knex) => {
  await knex.schema.raw(
    `create index "sentences_title_index" on "sentences" using GIN (to_tsvector('english', title))`
  )
}

exports.down = async (knex) => {
  await knex.schema.raw('drop index "sentences_title_index"')
}
