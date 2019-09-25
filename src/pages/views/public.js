'use strict'

const {
  button,
  form,
  textarea
} = require('hyperaxe')
const template = require('./components/template')
const post = require('./components/post')

module.exports = ({ messages }) => {
  const publishForm = '/publish/'

  return template(
    form({ action: publishForm, method: 'post' },
      textarea({ autofocus: true, required: true, name: 'text' }),
      button({
        type: 'submit'
      }, 'submit')),
    messages.map((msg) => post({ msg }))
  )
}
