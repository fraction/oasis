'use strict'

const debug = require('debug')('oasis')
const post = require('./models/post')
const replyAllView = require('./views/reply-all')

module.exports = async function replyPage (parentId) {
  const message = await post.get(parentId)
  debug('%O', message)

  return replyAllView({ message })
}
