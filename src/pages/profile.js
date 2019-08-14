'use strict'
const about = require('./models/about')
const post = require('./models/post')
const meta = require('./models/meta')
const authorView = require('./views/author')

module.exports = async function () {
  const whoami = await meta.whoami()
  const feedId = whoami.id

  const description = await about.description(feedId)
  const name = await about.name(feedId)
  const image = await about.image(feedId)

  const messages = await post.fromFeed(feedId)

  const avatarUrl = `/image/64/${encodeURIComponent(image)}`

  return authorView({
    feedId,
    messages,
    name,
    description,
    avatarUrl
  })
}
