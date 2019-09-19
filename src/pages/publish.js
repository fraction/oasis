'use strict'

const ssbMentions = require('ssb-mentions')
const post = require('./models/post')

module.exports = async function publishPage ({ text }) {
  const mentions = ssbMentions(text) || undefined
  return post.publish({
    text,
    mentions
  })
}
