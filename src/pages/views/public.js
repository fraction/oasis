'use strict'

const {
  button,
  form,
  textarea
} = require('hyperaxe')
const template = require('./components/template')
const post = require('./components/post')

module.exports = ({ messages, prefix = null }) => {
  const publishForm = '/publish/'

  return template(
    prefix,
    form({ action: publishForm, method: 'post' },
      textarea({ required: true, name: 'text' }),
      button({
        type: 'submit'
      }, 'submit')),
    messages.map((msg) => post({ msg }))
  )
}
