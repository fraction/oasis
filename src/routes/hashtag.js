const post = require('./models/post')
const views = require('./views')

module.exports = async function hashtag (ctx) {
  const hashtag = ctx.params.id

  const msgs = await post.fromHashtag(hashtag)

  ctx.body = await views('home', { msgs })
}
