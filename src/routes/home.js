const views = require('./views')
const post = require('./models/post')

module.exports = async function home (ctx) {
  const msgs = await post.latest()

  ctx.body = await views('home', { msgs })
}
