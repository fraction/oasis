'use strict'

const ssbMentions = require('ssb-mentions')
const post = require('./models/post')

module.exports = async function publishReplyPage ({ message, text }) {
  // TODO: rename `message` to `parent` or `ancestor` or similar
  const mentions = ssbMentions(text) || undefined

  const parent = await post.get(message)
  return post.reply({
    parent,
    message: { text, mentions }
  })
}
