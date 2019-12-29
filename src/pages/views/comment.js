'use strict'

const {
  a,
  button,
  form,
  textarea,
  p,
  strong
} = require('hyperaxe')

const debug = require('debug')('oasis:views:comment')
const template = require('./components/template')
const post = require('./components/post')

module.exports = async ({ messages, myFeedId, parentMessage }) => {
  let markdownMention

  const messageElements = await Promise.all(
    messages.reverse().map((message) => {
      debug('%O', message)
      const authorName = message.value.meta.author.name
      const authorFeedId = message.value.author
      if (authorFeedId !== myFeedId) {
        if (message.key === parentMessage.key) {
          const x = `[@${authorName}](${authorFeedId})\n\n`
          markdownMention = x
        }
      }
      return post({ msg: message })
    })
  )

  const action = `/comment/${encodeURIComponent(messages[0].key)}`
  const method = 'post'

  return template(
    messageElements,
    p('Write a ',
      strong('public comment'),
      ' on this thread with ',
      a({ href: 'https://commonmark.org/help/' }, 'Markdown'),
      '. Messages cannot be edited or deleted. To respond to an individual message, select ',
      strong('reply'),
      ' instead.'
    ),
    form({ action, method },
      textarea({
        autofocus: true,
        required: true,
        name: 'text'
      }, markdownMention),
      button({
        type: 'submit'
      }, 'comment'))
  )
}
