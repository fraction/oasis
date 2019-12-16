'use strict'

const {
  button,
  form,
  textarea
} = require('hyperaxe')
const debug = require('debug')('oasis')

const template = require('./components/template')
const post = require('./components/post')

module.exports = async ({ messages, myFeedId }) => {
  const likeForm = `/reply/${encodeURIComponent(messages[0].key)}`

  let markdownMention

  const messageElements = await Promise.all(
    messages.reverse().map((message) => {
      debug('%O', message)
      const authorName = message.value.meta.author.name
      const authorFeedId = message.value.author
      if (authorFeedId !== myFeedId) {
        if (message.key === messages[0].key) {
          const x = `[@${authorName}](${authorFeedId})\n\n`
          markdownMention = x
        }
      }
      return post({ msg: message })
    })
  )

  return template(
    messageElements,
    form({ action: likeForm, method: 'post' },
      textarea({
        autofocus: true,
        required: true,
        name: 'text'
      }, markdownMention),
      button({
        type: 'submit'
      }, 'reply'))
  )
}
