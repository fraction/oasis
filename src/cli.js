'use strict'

const yargs = require('yargs')

module.exports = () =>
  yargs
    .scriptName('oasis')
    .env('OASIS')
    .help('h')
    .alias('h', 'help')
    .usage('Usage: $0 [options]')
    .options('open', {
      describe: 'Automatically open app in web browser.  Use --no-open to disable.',
      default: true,
      type: 'boolean'
    })
    .options('offline', {
      describe: "Don't try to connect to scuttlebutt peers or pubs",
      default: false,
      type: 'boolean'
    })
    .options('host', {
      describe: 'Hostname for web app to listen on',
      default: 'localhost',
      type: 'string'
    })
    .options('port', {
      describe: 'Port for web app to listen on',
      default: 3000,
      type: 'number'
    })
    .options('debug', {
      describe: 'Use verbose output for debugging',
      default: false,
      type: 'boolean'
    })
    .argv
