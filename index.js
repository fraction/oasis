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
  .options('web-host', {
    describe: 'hostname for web app to listen on',
    default: 'localhost',
    type: 'string'
  })
  .options('web-port', {
    describe: 'port for web app to listen on',
    default: 3000,
    type: 'number'
  })
  .options('debug', {
    describe: 'verbose output for debugging',
    default: false,
    type: 'boolean'
  })
  .argv

app(config)
