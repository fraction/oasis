#!/usr/bin/env node

'use strict'

const yargs = require('yargs')
const fs = require('fs').promises
const path = require('path')

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
    type: 'string'
  })
  .options('port', {
    describe: 'Set port for web app to listen on',
    default: 3000,
    type: 'number'
  })
  .options('debug', {
    describe: 'Use verbose output for debugging',
    default: false,
    type: 'boolean'
  })
  .argv

// This hides arguments from other upstream modules who might parse them.
//
// Unfortunately some modules think that our CLI options are meant for them,
// and since there's no way to disable that behavior (!) we have to hide them
// manually by setting the args property to an empty array.
process.argv = []

if (config.debug) {
  process.env.DEBUG = '*'
}

const app = require('./src/app')

const start = async () => {
  config.readme = await fs.readFile(path.join(__dirname, 'README.md'), 'utf8')
  app(config)
}

start()
