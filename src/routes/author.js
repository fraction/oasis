const ssbRef = require('ssb-ref')

const about = require('./models/about')
const post = require('./models/post')
const views = require('./views')

module.exports = async function (ctx) {
  const feedId = ctx.params.id

  if (ssbRef.isFeed(feedId) === false) {
    throw new Error(`not a feed: ${ctx.params.id}`)
  }

  const description = await about.description(feedId)
  const name = await about.name(feedId)
  const image = await about.image(feedId)

  const msgs = await post.fromFeed(feedId)

  const avatarUrl = `http://localhost:8989/blobs/get/${image}`

  ctx.body = await views('author', {
    msgs,
    name,
    description,
    avatarUrl
  })
}
