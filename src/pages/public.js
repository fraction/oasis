'use strict'

const listView = require('./views/public')
const post = require('./models/post')

module.exports = async function publicPage ({ rootsOnly } = {}) {
  const messages = rootsOnly
    ? await post.threads({ private: false })
    : await post.latest({ private: false })

  return listView({ messages })
}
