'use strict'

const debug = require('debug')('oasis')
const post = require('./models/post')
const meta = require('./models/meta')
const replyView = require('./views/reply')

module.exports = async function replyPage (parentId) {
  const message = await post.get(parentId)
  const myFeedId = await meta.myFeedId()

  debug('%O', message)

  return replyView({ message, myFeedId })
}
