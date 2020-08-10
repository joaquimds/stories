import { slugify } from '../util/text'

exports.seed = async (knex) => {
  await knex('sentences').truncate()
  await knex('sentences').insert({
    content: "The hills across the valley of the Ebro' were long and white.",
    authorId: 1,
    title: 'Beginning',
    slug: slugify('Beginning'),
  })
  await knex('sentences').insert({
    content:
      'On this side there was no shade and no trees and the station was between two lines of rails in the sun.',
    authorId: 1,
    parentId: 1,
  })
  await knex('sentences').insert({
    content:
      'The American and the girl with him sat at a table in the shade, outside the building.',
    authorId: 1,
    parentId: 1,
  })
  await knex('sentences').insert({
    content:
      'Close against the side of the station there was the warm shadow of the building and a curtain, made of strings of bamboo beads hung across the open door into the bar, to keep out flies.',
    authorId: 1,
    parentId: 1,
  })
  await knex('sentences').insert({
    content:
      'It was very hot and the express from Barcelona would come in forty minutes.',
    authorId: 1,
    parentId: 3,
    title: 'Hills Like 100% Elephants',
    slug: slugify('Hills Like White Elephants'),
  })
  for (let i = 0; i < 10; i++) {
    await knex('sentences').insert({
      content: `Beginning ${i + 1}`,
      authorId: 1,
    })
  }
  for (let i = 0; i < 10; i++) {
    await knex('sentences').insert({
      content: `Test ${i + 1}`,
      authorId: 1,
      parentId: 1,
    })
  }
}
