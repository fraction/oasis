'use strict'

const post = require('./models/post')
const listView = require('./views/list')

module.exports = async function likesPage ({ feed }) {
  const messages = await post.likes({ feed })
  return listView({ messages })
}
