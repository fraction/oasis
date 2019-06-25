const md = require('ssb-markdown')
const toUrl = require('./to-url')

module.exports = (input) =>
  md.block(input, { toUrl: toUrl() })
