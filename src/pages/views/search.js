'use strict'

const template = require('./components/template')
const post = require('./components/post')
const {
  form,
  input,
  button,
  label,
  section
} = require('hyperaxe')

module.exports = ({ messages, query }) => template(
  section(
    form({ action: '/search', method: 'get' },
      label({ for: 'query' }, 'Search for messages that contain some word(s)'),
      input({ required: true, type: 'search', name: 'query', value: query }),
      button({
        type: 'submit'
      }, 'submit'))
  ),
  messages.map((msg) => post({ msg }))
)
