#!/usr/bin/env node
require('@babel/register')

const program = require('commander')
const { runCommand, knex, client } = require('../server')

program
  .command('create:user <username> <password>')
  .action((username, password) => run('createUser', username, password))

async function run(name, ...args) {
  await runCommand(name, ...args)
  await knex.destroy()
  await client.quit()
}

program.parse(process.argv)
