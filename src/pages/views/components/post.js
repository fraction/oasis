'use strict'

const {
  a,
  article,
  button,
  details,
  div,
  footer,
  form,
  header,
  img,
  section,
  span,
  summary,
  pre
} = require('hyperaxe')

const highlightJs = require('highlight.js')
const lodash = require('lodash')

module.exports = ({ msg }) => {
  const encoded = {
    key: encodeURIComponent(msg.key),
    author: encodeURIComponent(msg.value.author),
    parent: encodeURIComponent(msg.value.content.root)
  }

  const url = {
    author: `/author/${encoded.author}`,
    likeForm: `/like/${encoded.key}`,
    link: `/thread/${encoded.key}#${encoded.key}`,
    parent: `/thread/${encoded.parent}#${encoded.parent}`,
    avatar: msg.value.meta.author.avatar.url,
    json: `/json/${encoded.key}`,
    reply: `/reply/${encoded.key}`,
    replyAll: `/reply-all/${encoded.key}`
  }

  const isPrivate = Boolean(msg.value.meta.private)
  const isThreadTarget = Boolean(lodash.get(
    msg,
    'value.meta.thread.target',
    false
  ))
  const isReply = Boolean(lodash.get(
    msg,
    'value.meta.thread.reply',
    false
  ))

  const { name } = msg.value.meta.author
  const timeAgo = msg.value.meta.timestamp.received.since

  const depth = lodash.get(msg, 'value.meta.thread.depth', 0)

  const markdownContent = msg.value.meta.md.block()

  const hasContentWarning = typeof msg.value.content.contentWarning === 'string'

  const likeButton = msg.value.meta.voted
    ? { value: 0, class: 'liked' }
    : { value: 1, class: null }

  const likeCount = msg.value.meta.votes.length

  const parentLink = msg.value.content.root != null
    ? a({ href: url.parent }, 'parent')
    : null

  const messageClasses = ['message']

  if (isPrivate) {
    messageClasses.push('private')
  }

  if (isThreadTarget) {
    messageClasses.push('thread-target')
  }

  if (isReply) {
    messageClasses.push('reply')
  }

  const emptyContent = '<p>undefined</p>\n'
  const articleElement = markdownContent === emptyContent
    ? article({ class: 'content' }, pre({
      innerHTML: highlightJs.highlight(
        'json',
        JSON.stringify(msg, null, 2)
      ).value
    }))
    : article({ class: 'content', innerHTML: markdownContent })

  const articleContent = hasContentWarning
    ? details(
      summary(msg.value.content.contentWarning),
      articleElement
    )
    : articleElement

  const fragment =
    section({
      id: msg.key,
      class: messageClasses.join(' '),
      style: `border-left: ${depth}rem solid var(--bg-status);`
    },
    header({ class: 'metadata' },
      a({ href: url.author },
        img({ class: 'avatar', src: url.avatar, alt: '' })),
      span({ class: 'text' },
        span({ class: 'author' },
          a({ href: url.author }, name)),
        isPrivate ? ' privately 🔒' : null,
        span(` ${msg.value.meta.postType}`),
        span(` ${timeAgo} ago`),
        ':'
      )),
    articleContent,

    // HACK: centered-footer
    //
    // Here we create an empty div with an anchor tag that can be linked to.
    // In our CSS we ensure that this gets centered on the screen when we
    // link to this anchor tag.
    //
    // This is used for redirecting users after they like a post, when we
    // want the like button that they just clicked to remain close-ish to
    // where it was before they clicked the button.
    div({ id: `centered-footer-${encoded.key}`, class: 'centered-footer' }),

    footer(
      form({ action: url.likeForm, method: 'post' },
        button({
          name: 'voteValue',
          type: 'submit',
          value: likeButton.value,
          class: likeButton.class
        },
        `❤ ${likeCount}`)),
      isPrivate ? null : a({ href: url.reply }, 'reply'),
      isPrivate ? null : a({ href: url.replyAll }, 'reply all'),
      a({ href: url.link }, 'link'),
      parentLink,
      a({ href: url.json }, 'json')
    ))

  return fragment
}
