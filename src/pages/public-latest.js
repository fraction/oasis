'use strict'

const publicView = require('./views/public')
const post = require('./models/post')

module.exports = async function publicLatestPage () {
  const messages = await post.latest()
  return publicView({ messages })
}
