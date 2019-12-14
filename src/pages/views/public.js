'use strict'

const {
  button,
  form,
  label,
  section,
  textarea
} = require('hyperaxe')
const template = require('./components/template')
const post = require('./components/post')

module.exports = ({ messages, prefix = null }) => {
  const publishForm = '/publish/'

  return template(
    prefix,
    section(
      form({ action: publishForm, method: 'post' },
        label({ for: 'text' }, 'Publish a public message (cannot be edited or deleted)'),
        textarea({ required: true, name: 'text' }),
        button({ type: 'submit' }, 'submit')
      )
    ),
    messages.map((msg) => post({ msg }))
  )
}
