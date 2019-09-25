'use strict'

const {
  button,
  form,
  textarea
} = require('hyperaxe')

const template = require('./components/template')
const post = require('./components/post')

module.exports = ({ message }) => {
  const likeForm = `/reply/${encodeURIComponent(message.key)}`

  const authorName = message.value.meta.author.name
  const authorFeedId = message.value.author
  const markdownMention = `[@${authorName}](${authorFeedId})\n\n`

  return template(
    post({ msg: message }),
    form({ action: likeForm, method: 'post' },
      textarea({ autofocus: true, required: true, name: 'text' }, markdownMention),
      button({
        type: 'submit'
      }, 'reply'))
  )
}
