'use strict'

const post = require('./models/post')
const listView = require('./views/list')

module.exports = async function likesPage () {
  console.log('starting likes')
  const messages = await post.likes()
  return listView({ messages })
}
