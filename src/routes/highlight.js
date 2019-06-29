const requireStyle = require('require-style')

module.exports = async function (ctx) {
  ctx.type = 'text/css'
  const filePath = `highlight.js/styles/${ctx.params.id}`
  ctx.body = requireStyle(filePath)
}
