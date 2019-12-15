'use strict'

const {
  a,
  button,
  form,
  label,
  section,
  header,
  strong,
  textarea
} = require('hyperaxe')
const template = require('./components/template')
const post = require('./components/post')

module.exports = ({ messages, prefix = null }) => {
  const publishForm = '/publish/'

  return template(
    prefix,
    section(
      header(strong('🌐 Publish')),
      form({ action: publishForm, method: 'post' },
        label(
          { for: 'text' },
          'Write a new message in ',
          a({
            href: 'https://commonmark.org/help/',
            target: '_blank'
          }, 'Markdown'),
          '. Messages cannot be edited or deleted.'
        ),
        textarea({ required: true, name: 'text' }),
        button({ type: 'submit' }, 'submit')
      )
    ),
    messages.map((msg) => post({ msg }))
  )
}
