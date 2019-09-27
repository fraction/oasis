'use strict'

const {
  p,
  button,
  form,
  textarea
} = require('hyperaxe')

const debug = require('debug')('oasis:views:reply-all')
const template = require('./components/template')
const post = require('./components/post')

module.exports = async ({ messages }) => {
  let markdownMention

  const messageElements = await Promise.all(messages.reverse().map((message) => {
    debug('%O', message)
    const authorName = message.value.meta.author.name
    const authorFeedId = message.value.author
    markdownMention = `[@${authorName}](${authorFeedId})\n\n`
    return post({ msg: message })
  }))

  const action = `/reply-all/${encodeURIComponent(messages[0].key)}`
  const method = 'post'

  const warning = p({ style: 'text-align: center;' }, '[showing maximum of two posts from thread, others may exist]')

  return template(
    messageElements,
    warning,
    form({ action, method },
      textarea({
        autofocus: true,
        required: true,
        name: 'text'
      }, markdownMention),
      button({
        type: 'submit'
      }, 'reply all'))
  )
}
