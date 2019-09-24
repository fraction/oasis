'use strict'

const markdownView = require('./views/markdown')

module.exports = async function statusPage (text) {
  return markdownView({ text })
}
