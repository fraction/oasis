'use strict'

const {
  button,
  form,
  p,
  textarea
} = require('hyperaxe')

const template = require('./components/template')
const post = require('./components/post')

const apology = `Hi! The reply is a work-in-progress and sort of sucks right now.
It should auto-generate a Markdown mention for the person you're replying to
and JSON mentions for anything you reference, but these messages are <strong>
public</strong>. Please do not share private information in this reply box.
`

module.exports = ({ message }) => {
  const likeForm = `/reply/${encodeURIComponent(message.key)}`

  const authorName = message.value.meta.author.name
  const authorFeedId = message.value.author
  const markdownMention = `[@${authorName}](${authorFeedId})\n\n`

  return template(
    post({ msg: message }),
    form({ action: likeForm, method: 'post' },
      p({ innerHTML: apology }),
      textarea({ autofocus: true, required: true, name: 'text' }, markdownMention),
      button({
        type: 'submit'
      }, 'reply (public!!!)')
    )
  )
}
