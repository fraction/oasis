'use strict'

const highlightJs = require('highlight.js')
const {
  a,
  article,
  footer,
  h1,
  header,
  img,
  pre,
  section,
  span
} = require('hyperaxe')
const post = require('./components/post')

const template = require('./components/template')

module.exports = ({
  aboutPairs,
  avatarUrl,
  description,
  feedId,
  messages,
  name,
  relationship
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
      : null,
    footer(
      a({ href: `/likes/${encodeURIComponent(feedId)}` }, 'view likes'),
      span(relationship)
    )
  )

  return template(
    prefix,
    messages.map((msg) => post({ msg }))
  )
}
