import { slugify } from '../util/text'

exports.seed = async (knex) => {
  await knex('sentences').truncate()
  await knex('sentence_links').truncate()
  await knex('sentences').insert({
    id: 0,
    content: '',
  })
  await knex('sentences').insert({
    // id: 1,
    content: "The hills across the valley of the Ebro' were long and white.",
    authorId: 1,
    title: 'Beginning',
    slug: slugify('Beginning'),
  })
  await knex('sentenceLinks').insert({
    from: 0,
    to: 1,
  })
  await knex('sentences').insert({
    // id: 2,
    content:
      'On this side there was no shade and no trees and the station was between two lines of rails in the sun.',
    authorId: 1,
  })
  await knex('sentenceLinks').insert({
    from: 1,
    to: 2,
  })
  await knex('sentences').insert({
    // id: 3,
    content:
      'Close against the side of the station there was the warm shadow of the building and a curtain, made of strings of bamboo beads hung across the open door into the bar, to keep out flies.',
    authorId: 1,
    title: 'Following',
    slug: slugify('Following'),
  })
  await knex('sentenceLinks').insert({
    from: 1,
    to: 3,
  })
  await knex('sentences').insert({
    // id: 4,
    content:
      'The American and the girl with him sat at a table in the shade, outside the building.',
    authorId: 1,
    title: 'Alternate',
    slug: slugify('Alternate'),
  })
  await knex('sentenceLinks').insert({
    from: 1,
    to: 4,
  })
  await knex('sentences').insert({
    // id: 5,
    content:
      'It was very hot and the express from Barcelona would come in forty minutes.',
    authorId: 1,
  })
  await knex('sentenceLinks').insert({
    from: 1,
    to: 5,
  })
  await knex('sentences').insert({
    // id: 6,
    content:
      'It stopped at this junction for two minutes and went on to Madrid.',
    authorId: 1,
    title: 'Ending',
    slug: slugify('Ending'),
  })
  await knex('sentenceLinks').insert({
    from: 3,
    to: 6,
  })
  await knex('sentenceLinks').insert({
    from: 4,
    to: 6,
  })
  await knex('sentenceLinks').insert({
    from: 6,
    to: 1,
  })
  await knex('sentences').insert({
    // id: 7,
    content: '"What should we drink?" the girl asked.',
    authorId: 1,
  })
  await knex('sentenceLinks').insert({
    from: 6,
    to: 7,
  })
  // id: 8,
  await knex('sentences').insert({
    content: 'She had taken off her hat and put it on the table.',
    authorId: 1,
  })
  await knex('sentenceLinks').insert({
    from: 7,
    to: 8,
  })
}
