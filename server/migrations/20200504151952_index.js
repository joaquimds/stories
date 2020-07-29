exports.up = (knex) => {
  return knex.schema.raw(
    `create index "sentence_content_index" on "sentences" using GIN (to_tsvector('english', content))`
  )
}

exports.down = (knex) => {
  return knex.schema.raw('drop index "sentence_content_index"')
}
