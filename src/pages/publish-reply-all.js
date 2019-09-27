'use strict'

const ssbMentions = require('ssb-mentions')
const post = require('./models/post')

module.exports = async function publishReplyAllPage ({ message, text }) {
  // TODO: rename `message` to `parent` or `ancestor` or similar
  const mentions = ssbMentions(text) || undefined

  return post.replyAll({
    parent: message,
    message: { text, mentions }
  })
}
