const ssbRef = require('ssb-ref')

const about = require('./models/about')
const post = require('./models/post')
const meta = require('./models/meta')
const authorView = require('./views/author')

module.exports = async function (ctx) {
  const whoami = await meta.whoami()
  const feedId = whoami.id

  if (ssbRef.isFeed(feedId) === false) {
    throw new Error(`not a feed: ${ctx.params.id}`)
  }

  const description = await about.description(feedId)
  const name = await about.name(feedId)
  const image = await about.image(feedId)

  const messages = await post.fromFeed(feedId)

  const avatarUrl = `http://localhost:8989/blobs/get/${image}`

  ctx.body = authorView({
    messages,
    name,
    description,
    avatarUrl
  })
}
