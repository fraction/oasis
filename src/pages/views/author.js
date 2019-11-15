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
  table,
  tbody,
  td,
  th,
  thead,
  tr
} = require('hyperaxe')
const post = require('./components/post')

const template = require('./components/template')

module.exports = ({
  aboutPairs,
  avatarUrl,
  description,
  feedId,
  messages,
  name
}) => {
  const mention = `[@${name}](${feedId})`
  const markdownMention = highlightJs.highlight('markdown', mention).value

  const alreadyHandled = [
    'description',
    'image',
    'name'
  ]
  const metaRows = Object.entries(aboutPairs)
    .filter(([key]) => alreadyHandled.includes(key) === false)
    .map(([key, value]) => tr(td(key), td(value)))

  const metaTable = metaRows.length > 0
    ? table(
      thead(
        tr(th('key'), th('value'))
      ),
      tbody(metaRows)
    )
    : null

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
    metaTable,
    footer(
      a({ href: `/likes/${encodeURIComponent(feedId)}` }, 'view likes')
    )
  )

  return template(
    prefix,
    messages.map((msg) => post({ msg }))
  )
}
