#!/usr/bin/env node

const yargs = require('yargs')
const app = require('./src/app')

const config = yargs
  .env('OASIS')
  .usage('Usage: $0 [options]')
  .options('open', {
    describe: 'automatically open app in web browser',
    default: true,
    type: 'boolean'
  })
  .options('host', {
    describe: 'hostname to listen on',
    default: 'localhost',
    type: 'string'
  })
  .options('port', {
    describe: 'port to listen on',
    default: 3000,
    type: 'number'
  })
  .argv

app(config)
