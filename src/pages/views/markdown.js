'use strict'

const { section } = require('hyperaxe')
const ssbMarkdown = require('ssb-markdown')
const template = require('./components/template')

module.exports = ({ text }) => {
  const rawHtml = ssbMarkdown.block(text)

  return template(
    section({ class: 'message' }, { innerHTML: rawHtml })
  )
}
