'use strict'

const post = require('./models/post')
const replyAllView = require('./views/reply-all')
const ssbRef = require('ssb-ref')

module.exports = async function replyPage (parentId) {
  const parentMessage = await post.get(parentId)

  const messages = [parentMessage]

  const hasRoot = typeof parentMessage.value.content.root === 'string' && ssbRef.isMsg(parentMessage.value.content.root)
  console.log('got root ', parentMessage.value.content)
  if (hasRoot) {
    messages.push(await post.get(parentMessage.value.content.root))
  }

  return replyAllView({ messages })
}
