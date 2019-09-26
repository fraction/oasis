'use strict'

const post = require('./models/post')
const listView = require('./views/list')

module.exports = async function mentionsPage () {
  const messages = await post.mentionsMe()

  return listView({ messages })
}
