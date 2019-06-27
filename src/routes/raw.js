const meta = require('./models/meta')

module.exports = async function thread (ctx) {
  const msgId = ctx.params.id
  const message = await meta.get(msgId)

  ctx.body = message
}
