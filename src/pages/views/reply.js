'use strict'

const {
  button,
  form,
  textarea
} = require('hyperaxe')

const template = require('./components/template')
const post = require('./components/post')

const apology = `sorry this sucks right now, it's just plaintext and won't even
create a mention to the person you're talking to -- soon it will be better!
`

module.exports = ({ message }) => {
  const likeForm = `/reply/${encodeURIComponent(message.key)}`

  return template(
    post({ msg: message }),
    form({ action: likeForm, method: 'post' },
      textarea({ name: 'text', placeholder: apology }),
      button({
        type: 'submit'
      }, 'reply (public!!!)')
    )
  )
}
