'use strict'

const template = require('./components/template')
const post = require('./components/post')

module.exports = ({ messages }) => template(
  messages.map((msg) => post({ msg }))
)
