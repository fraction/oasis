#!/usr/bin/env node

'use strict'
const yargs = require('yargs')
const app = require('./src/app')

const config = yargs
  .env('OASIS')
  .usage('Usage: $0 [options]')
  .options('open', {
    describe: 'Automatically open app in web browser',
    default: true,
    type: 'boolean'
  })
  .options('host', {
    describe: 'Hostname for web app to listen on',
    default: 'localhost',
    type: 'string',
    alias: 'web-host' // deprecated
  })
  .options('port', {
    describe: 'Set port for web app to listen on',
    default: 3000,
    type: 'number',
    alias: 'web-port' // deprecated
  })
  .options('debug', {
    describe: 'Use verbose output for debugging',
    default: false,
    type: 'boolean'
  })
  .argv

console.log(config)
app(config)
