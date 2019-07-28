'use strict'
const requireStyle = require('require-style')

module.exports = function (style) {
  const filePath = `highlight.js/styles/${style}`
  return requireStyle(filePath)
}
