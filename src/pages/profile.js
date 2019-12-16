'use strict'

const about = require('./models/about')
const post = require('./models/post')
const meta = require('./models/meta')
const authorView = require('./views/author')

module.exports = async function profilePage () {
  const myFeedId = await meta.myFeedId()

  const description = await about.description(myFeedId)
  const name = await about.name(myFeedId)
  const image = await about.image(myFeedId)
  const aboutPairs = await about.all(myFeedId)

  const messages = await post.fromFeed(myFeedId)

  const avatarUrl = `/image/256/${encodeURIComponent(image)}`

  return authorView({
    feedId: myFeedId,
    messages,
    name,
    description,
    avatarUrl,
    aboutPairs,
    relationship: null
  })
}
