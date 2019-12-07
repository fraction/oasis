'use strict'

const template = require('./components/template')
const post = require('./components/post')
const { form, input, button } = require('hyperaxe')

module.exports = ({ messages, query }) => template(
  form({ action: '/search', method: 'get' },
    input({ required: true, type: 'search', name: 'query', value: query }),
    button({
      type: 'submit'
    }, 'submit')),
  messages.map((msg) => post({ msg }))
)
