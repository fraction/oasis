const debug = require('debug')('oasis:route-thread')

const listView = require('./views/list')
const post = require('./models/post')

module.exports = async function thread (ctx) {
  debug('called thread!')
  const msgId = ctx.params.id
  debug('thread ID: %s', msgId)
  const messages = await post.fromThread(msgId)
  debug('got %i messages', messages.length)

  ctx.body = listView({ messages })
}
