'use strict'

const {
  button,
  form,
  textarea
} = require('hyperaxe')

const template = require('./components/template')

module.exports = () => {
  const publishForm = '/publish/'

  return template(
    form({ action: publishForm, method: 'post' },
      textarea({ autofocus: true, required: true, name: 'text' }),
      button({
        type: 'submit'
      }, 'publish (public!!!)'))
  )
}
