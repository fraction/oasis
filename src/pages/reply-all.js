'use strict'

const post = require('./models/post')
const meta = require('./models/meta')
const replyAllView = require('./views/reply-all')
const ssbRef = require('ssb-ref')

module.exports = async function replyPage (parentId) {
  const parentMessage = await post.get(parentId)
  const myFeedId = await meta.myFeedId()

  const hasRoot = typeof parentMessage.value.content.root === 'string' && ssbRef.isMsg(parentMessage.value.content.root)

  const rootMessage = hasRoot
    ? await post.get(parentMessage.value.content.root)
    : parentMessage

  const messages = hasRoot
    ? await post.fromRoot(parentMessage.value.content.root)
    : await post.fromRoot(parentId)

  messages.push(rootMessage)

  return replyAllView({ messages, myFeedId, parentMessage })
}
