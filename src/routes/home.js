const listView = require('./views/list')
const post = require('./models/post')

module.exports = async function home (ctx) {
  const msgs = await post.latest()

  ctx.body = listView({ msgs })
}
