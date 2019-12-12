'use strict'

const post = require('./models/post')
const searchView = require('./views/search')

module.exports = async function searchPage ({ query }) {
  if (typeof query === 'string') {
    // https://github.com/ssbc/ssb-search/issues/7
    query = query.toLowerCase()
  }

  const messages = await post.search({ query })

  return searchView({ messages, query })
}
