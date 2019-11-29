'use strict'

const ssbMentions = require('ssb-mentions')
const post = require('./models/post')
const meta = require('./models/post')

module.exports = async function publishReplyAllPage ({ message, text }) {
  // TODO: rename `message` to `parent` or `ancestor` or similar
  const mentions = ssbMentions(text).filter((mention) =>
    mention != null
  ) || undefined
  const parent = await meta.get(message)

  return post.replyAll({
    parent,
    message: { text, mentions }
  })
}
