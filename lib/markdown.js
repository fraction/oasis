const ssbMd = require('ssb-markdown')
const toUrl = require('./to-url')

module.exports = (msg) =>
  ssbMd.block(msg.value.content.text, { toUrl: toUrl(msg) })
