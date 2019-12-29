'use strict'

const debug = require('debug')('oasis')
const post = require('./models/post')
const meta = require('./models/meta')
const replyView = require('./views/reply')

module.exports = async function replyPage (parentId) {
  const rootMessage = await post.get(parentId)
  const myFeedId = await meta.myFeedId()

  debug('%O', rootMessage)
  const messages = [rootMessage]

  return replyView({ messages, myFeedId })
}
