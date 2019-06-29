const meta = require('./models/meta')
const statusView = require('./views/status')

module.exports = async function hashtag (ctx) {
  const status = await meta.status()

  ctx.body = statusView({ status })
}
