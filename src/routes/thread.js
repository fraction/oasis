const listView = require('./views/list')
const post = require('./models/post')

module.exports = async function thread (ctx) {
  const msgId = ctx.params.id
  const messages = await post.fromThread(msgId)

  ctx.body = listView({ messages })
}
