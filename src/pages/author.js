'use strict'

const about = require('./models/about')
const post = require('./models/post')
const friend = require('./models/friend')
const authorView = require('./views/author')

module.exports = async function authorPage (feedId) {
  const description = await about.description(feedId)
  const name = await about.name(feedId)
  const image = await about.image(feedId)
  const aboutPairs = await about.all(feedId)
  const messages = await post.fromFeed(feedId)
  const relationship = await friend.getRelationship(feedId)

  const avatarUrl = `/image/256/${encodeURIComponent(image)}`

  return authorView({
    feedId,
    messages,
    name,
    description,
    avatarUrl,
    aboutPairs,
    relationship
  })
}
