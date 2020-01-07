#!/usr/bin/env node

'use strict'

const yargs = require('yargs')
const fs = require('fs').promises
const path = require('path')

const config = yargs
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

// This hides arguments from other upstream modules who might parse them.
//
// Unfortunately some modules think that our CLI options are meant for them,
// and since there's no way to disable that behavior (!) we have to hide them
// manually by setting the args property to an empty array.
process.argv = []

if (config.debug) {
  process.env.DEBUG = 'oasis,oasis:*'
}

// Awful hack to get the offline config setting deep into src/pages/models/lib/server.js
process.env.OASIS_OFFLINE = '' + config.offline

const app = require('./src/app')

const start = async () => {
  const filePath = path.join(__dirname, 'README.md')
  config.readme = await fs.readFile(filePath, 'utf8')
  app(config)
}

start()
