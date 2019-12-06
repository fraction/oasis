'use strict'

const listView = require('./views/public')
const post = require('./models/post')

module.exports = async function publicPage ({ sort }) {
  switch (sort) {
    case 'popular': {
      const messages = await post.popular({ private: false })
      return listView({ messages })
    }
    case 'latest': {
      const messages = await post.latest({ private: false })
      return listView({ messages })
    }
    default: {
      throw new Error('Unknown sort style')
    }
  }
}
