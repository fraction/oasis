const post = require('./models/post')
const listView = require('./views/list')

module.exports = async function hashtag (ctx) {
  const hashtag = ctx.params.id

  const msgs = await post.fromHashtag(hashtag)

  ctx.body = listView({ msgs })
}
