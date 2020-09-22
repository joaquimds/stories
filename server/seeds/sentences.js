import { slugify } from '../util/text'

exports.seed = async (knex) => {
  await knex('sentences').truncate()
  await knex('sentences').insert({
    // id: 1,
    content: "The hills across the valley of the Ebro' were long and white.",
    authorId: 1,
    title: 'Beginning',
    slug: slugify('Beginning'),
  })
  await knex('sentences').insert({
    // id: 2,
    content:
      'On this side there was no shade and no trees and the station was between two lines of rails in the sun.',
    authorId: 1,
    parentId: 1,
  })
  await knex('sentences').insert({
    // id: 3,
    content:
      'Close against the side of the station there was the warm shadow of the building and a curtain, made of strings of bamboo beads hung across the open door into the bar, to keep out flies.',
    authorId: 1,
    parentId: 1,
    title: 'Following',
    slug: slugify('Following'),
  })
  await knex('sentences').insert({
    // id: 4,
    content:
      'The American and the girl with him sat at a table in the shade, outside the building.',
    authorId: 1,
    parentId: 1,
  })
  await knex('sentences').insert({
    // id: 5,
    content:
      'It was very hot and the express from Barcelona would come in forty minutes.',
    authorId: 1,
    parentId: 1,
  })
  await knex('sentences').insert({
    // id: 6,
    content:
      'It stopped at this junction for two minutes and went on to Madrid.',
    authorId: 1,
    parentId: 3,
    title: 'Ending',
    slug: slugify('Ending'),
  })
  await knex('sentences').insert({
    // id: 7,
    content: '"What should we drink?" the girl asked.',
    authorId: 1,
    parentId: 6,
  })
  // id: 8,
  await knex('sentences').insert({
    content: 'She had taken off her hat and put it on the table.',
    authorId: 1,
    parentId: 7,
  })
}
