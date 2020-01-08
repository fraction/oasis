'use strict'

const template = require('./components/template')
const post = require('./components/post')
const {
  form,
  input,
  button,
  label,
  section,
  strong,
  header
} = require('hyperaxe')

module.exports = ({ messages, query }) => template(
  section(
    form({ action: '/search', method: 'get' },
      header(strong('Search')),
      label({ for: 'query' }, 'Add word(s) to look for in downloaded messages.'),
      input({ required: true, type: 'search', name: 'query', value: query }),
      button({
        type: 'submit'
      }, 'submit'))
  ),
  messages.map((msg) => post({ msg }))
)
