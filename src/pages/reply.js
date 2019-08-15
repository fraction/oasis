'use strict'

const debug = require('debug')('oasis')
const post = require('./models/post')
const replyView = require('./views/reply')

module.exports = async function replyPage (parentId) {
  const message = await post.get(parentId)
  debug('%O', message)

  return replyView({ message })
}
