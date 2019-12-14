module.exports = () => ''

const listView = require('./views/list')
const post = require('./models/post')

module.exports = async function publicPage () {
  const messages = await post.inbox()

  return listView({ messages })
}
