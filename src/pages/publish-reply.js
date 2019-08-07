'use strict'

const post = require('./models/post')

module.exports = async function ({ message, text }) {
  return post.publish({
    root: message,
    branch: message,
    text
  })
}
