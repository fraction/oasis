#!/usr/bin/env node

'use strict'

const yargs = require('yargs')

module.exports = () =>
  yargs
    .scriptName('oasis')
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
