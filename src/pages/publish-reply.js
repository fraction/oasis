'use strict'

const ssbMentions = require('ssb-mentions')
const post = require('./models/post')

module.exports = async function publishReplyPage ({ message, text }) {
  const mentions = ssbMentions(text) || undefined
  return post.publish({
    root: message,
    branch: message,
    text,
    mentions
  })
}
