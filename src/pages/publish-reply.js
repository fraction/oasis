'use strict'

const post = require('./models/post')
const ssbMentions = require('ssb-mentions')

module.exports = async function ({ message, text }) {

  const mentions = ssbMentions(text) || undefined
  return post.publish({
    root: message,
    branch: message,
    text,
    mentions
  })
}
