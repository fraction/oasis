'use strict'
const vote = require('./models/vote')
const post = require('./models/post')

module.exports = async function like ({ messageKey, voteValue }) {
  const value = Number(voteValue)
  const message = await post.get(messageKey)

  const isPrivate = message.value.meta.private === true
  const messageRecipients = isPrivate ? message.value.content.recps : []

  const normalized = messageRecipients.map(recipient => {
    if (typeof recipient === 'string') {
      return recipient
    }

    if (typeof recipient.link === 'string') {
      return recipient.link
    }
  })

  const recipients = normalized.length > 0 ? normalized : undefined

  return vote.publish({ messageKey, value, recps: recipients })
}
