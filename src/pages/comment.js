'use strict'

const post = require('./models/post')
const meta = require('./models/meta')
const commentView = require('./views/comment')
const ssbRef = require('ssb-ref')

module.exports = async function commentPage (parentId) {
  const parentMessage = await post.get(parentId)
  const myFeedId = await meta.myFeedId()

  const hasRoot = typeof parentMessage.value.content.root === 'string' && ssbRef.isMsg(parentMessage.value.content.root)
  const hasFork = typeof parentMessage.value.content.fork === 'string' && ssbRef.isMsg(parentMessage.value.content.fork)

  const rootMessage = hasRoot
    ? hasFork
      ? parentMessage
      : await post.get(parentMessage.value.content.root)
    : parentMessage

  const messages = await post.threadReplies(rootMessage.key)

  messages.push(rootMessage)

  return commentView({ messages, myFeedId, parentMessage })
}
