module.exports = () => ''

const listView = require('./views/public')
const post = require('./models/post')

module.exports = async function publicPage () {
  const messages = await post.inbox()

  return listView({ messages })
}
