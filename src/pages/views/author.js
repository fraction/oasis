'use strict'
const highlightJs = require('highlight.js')
const post = require('./components/post')
const {
  article,
  header,
  img,
  h1,
  section,
  pre
} = require('hyperaxe')

const template = require('./components/template')

module.exports = ({ avatarUrl, name, description, messages, feedId }) => {
  const markdownMention = highlightJs.highlight('markdown', `[@${name}](${feedId})`).value

  const prefix = section({ class: 'message' },
    header({ class: 'profile' },
      img({ class: 'avatar', src: avatarUrl }),
      h1(name)
    ),
    pre({
      class: 'md-mention',
      innerHTML: markdownMention
    }),
    description !== '<p>null</p>\n'
      ? article({ innerHTML: description })
      : null
  )

  return template(
    prefix,
    messages.map(msg =>
      post({ msg })
    )
  )
}
