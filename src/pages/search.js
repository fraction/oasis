'use strict'

const post = require('./models/post')
const searchView = require('./views/search')

module.exports = async function searchPage ({ query }) {
  const messages = await post.search({ query })

  return searchView({ messages, query })
}
