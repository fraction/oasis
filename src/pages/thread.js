'use strict'

const debug = require('debug')('oasis:route-thread')

const listView = require('./views/list')
const post = require('./models/post')

module.exports = async function threadPage (message) {
  const messages = await post.fromThread(message)
  debug('got %i messages', messages.length)

  return listView({ messages })
}
