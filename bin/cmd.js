#!/usr/bin/env node

require('@babel/register')

const program = require('commander')
const { runCommand, knex, client, transporter } = require('../server')

program.command('fixtures:create').action(() => run('createFixtures'))

program.command('fixtures:minimal').action(() => run('createMinimalFixtures'))

program.command('notifications:send').action(() => run('sendNotifications'))

async function run(name, ...args) {
  await runCommand(name, ...args)
  await knex.destroy()
  await client.quit()
  await transporter.close()
}

program.parse(process.argv)
