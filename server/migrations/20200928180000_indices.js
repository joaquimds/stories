exports.up = async (knex) => {
  await knex.schema.raw(
    `create index "title_title_index" on "titles" using gist (title gist_trgm_ops)`
  )
  await knex.schema.raw(
    `create index "sentences_content_index" on "sentences" using gist (content gist_trgm_ops)`
  )
  await knex.schema.raw(
    `create index "likes_story_id_index" on "likes" using gist (story_id gist_trgm_ops)`
  )
}

exports.down = async (knex) => {
  await knex.schema.raw('drop index "title_title_index"')
  await knex.schema.raw('drop index "sentences_content_index"')
  await knex.schema.raw('drop index "likes_story_id_index"')
}
