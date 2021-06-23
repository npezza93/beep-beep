#!/usr/bin/env node

import { Command } from 'commander'
import fs          from 'fs'
import Client      from './src/client.js'
import Server      from './src/server.js'

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const program = new Command()

program
  .command('server')
  .description('run beep-beep server')
  .requiredOption('-q, --queue <count>', 'How many ptys should be queued up', coerceInt)
  .requiredOption('-s, --shell <file-path>', 'File path to the shell to run')
  .option('-a, --args <args>', 'Arguments to passed to the shell (comma separated)')
  .action((options) => {
    new Server(options.queue, options.shell, options.args).run()
  })

program
  .version(packageJson.version)
  .action(() => new Client().run())

program.parse(process.argv)

function coerceInt(value, previous) {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidOptionArgumentError('Not a number.');
  } else if (parsedValue < 1) {
    throw new InvalidOptionArgumentError('Must be at least 1');
  }
  return parsedValue;
}
