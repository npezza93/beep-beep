#!/usr/bin/env node

import { Command } from 'commander'
import fs          from 'fs'
import Client      from './src/client.js'
import Server      from './src/server.js'
import Config      from './src/config.js'

const program = new Command()

program
  .name('beep-beep')
  .command('server')
  .option('-q, --queue <count>', 'How many ptys should be queued up', coerceInt, 1)
  .option('-s, --shell <file-path>', 'File path to the shell to run', process.env.SHELL || '/bin/zsh')
  .option('-a, --args <args>', 'Arguments to passed to the shell (comma separated)')
  .option('-c, --config-file <file-path>', 'Read options via specified json config file')
  .option('-w, --watch <absolute-paths>', 'If any of the supplied files change, the enqueued ptys are restarted (comma separated)')
  .helpOption('-h, --help', 'Prints help information')
  .addHelpText('before', `beep-beep-server\nRuns a beep-beep server of ptys\n`)
  .usage('[OPTIONS]')
  .action((options) => {
    new Server(new Config(options)).run()
  })

program
  .helpOption('-h, --help', 'Prints help information')
  .version('beep-beep 0.0.3-alpha', '-v, --version', 'Prints version information')
  .addHelpText('before', `${program.version()}\nNick Pezza <pezza@hey.com>\n`)
  .usage('[OPTIONS] [SUBCOMMAND]')
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
