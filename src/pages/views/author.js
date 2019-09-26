'use strict'

const highlightJs = require('highlight.js')
const {
  article,
  header,
  img,
  h1,
  section,
  pre
} = require('hyperaxe')
const post = require('./components/post')

const template = require('./components/template')

module.exports = ({
  avatarUrl, name, description, messages, feedId
}) => {
  const mention = `[@${name}](${feedId})`
  const markdownMention = highlightJs.highlight('markdown', mention).value

  const prefix = section({ class: 'message' },
    header({ class: 'profile' },
      img({ class: 'avatar', src: avatarUrl }),
      h1(name)),
    pre({
      class: 'md-mention',
      innerHTML: markdownMention
    }),
    description !== '<p>null</p>\n'
      ? article({ innerHTML: description })
      : null)

  return template(
    prefix,
    messages.map((msg) => post({ msg }))
  )
}
