'use strict'

const post = require('./models/post')
const meta = require('./models/meta')
const replyAllView = require('./views/reply-all')
const ssbRef = require('ssb-ref')

module.exports = async function replyPage (parentId) {
  const parentMessage = await post.get(parentId)
  const myFeedId = await meta.myFeedId()

  const messages = [parentMessage]

  const hasRoot = typeof parentMessage.value.content.root === 'string' && ssbRef.isMsg(parentMessage.value.content.root)
  if (hasRoot) {
    messages.push(await post.get(parentMessage.value.content.root))
  }

  return replyAllView({ messages, myFeedId })
}
