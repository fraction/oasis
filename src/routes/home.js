const listView = require('./views/list')
const post = require('./models/post')

module.exports = async function home (ctx) {
  const messages = await post.latest()

  ctx.body = listView({ messages })
}
