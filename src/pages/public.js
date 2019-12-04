'use strict'

const listView = require('./views/public')
const post = require('./models/post')

module.exports = async function publicPage ({ dogFood = false, rootsOnly = false } = {}) {
  const method = rootsOnly
    ? post.threads
    : post.comments

  const messages = await method({ private: false, dogFood })

  return listView({ messages })
}
