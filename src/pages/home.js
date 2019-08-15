'use strict'

const listView = require('./views/list')
const post = require('./models/post')

module.exports = async function homePage () {
  const messages = await post.latest()

  return listView({ messages })
}
