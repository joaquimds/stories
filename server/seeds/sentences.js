exports.seed = async (knex) => {
  await knex('sentences').truncate()
  await knex('sentences').insert([
    {
      content: "The hills across the valley of the Ebro' were long and white.",
      authorId: 1,
    },
    {
      content:
        'On this side there was no shade and no trees and the station was between two lines of rails in the sun.',
      authorId: 1,
      parentId: 1,
    },
    {
      content:
        'The American and the girl with him sat at a table in the shade, outside the building.',
      authorId: 1,
      parentId: 1,
    },
    {
      content:
        'Close against the side of the station there was the warm shadow of the building and a curtain, made of strings of bamboo beads hung across the open door into the bar, to keep out flies.',
      authorId: 1,
      parentId: 2,
    },
    {
      content:
        'It was very hot and the express from Barcelona would come in forty minutes.',
      authorId: 1,
      parentId: 2,
    },
  ])
}
