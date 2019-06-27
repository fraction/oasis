const views = require('./views')
const post = require('./models/post')

module.exports = async function thread (ctx) {
  const msgId = ctx.params.id
  const msgs = await post.fromThread(msgId)

  ctx.body = await views('home', { msgs })
}
