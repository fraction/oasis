const requireStyle = require('require-style')

module.exports = function (style) {
  const filePath = `highlight.js/styles/${style}`
  return {
    body: requireStyle(filePath),
    type: 'text/css'
  }
}
