'use strict'
const {
  a,
  abbr,
  div,
  header,
  img,
  section,
  article,
  span,
  form,
  button,
  footer
} = require('hyperaxe')

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
    context: `/thread/${encoded.key}#${encoded.key}`,
    parent: `/thread/${encoded.parent}#${encoded.parent}`,
    avatar: msg.value.meta.author.avatar.url,
    raw: `/raw/${encoded.key}`
  }

  const isPrivate = Boolean(msg.value.meta.private)
  const isThreadTarget = Boolean(lodash.get(msg, 'value.meta.thread.target', false))

  const name = msg.value.meta.author.name
  const timeAgo = msg.value.meta.timestamp.received.since

  const depth = lodash.get(msg, 'value.meta.thread.depth', 0)

  const markdownContent = msg.value.meta.md.block()

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

  const fragment =
    section({
      id: msg.key,
      class: messageClasses.join(' '),
      style: `margin-left: ${depth * 1.5}rem`
    },
    header({ class: 'metadata' },
      a({ href: url.author },
        img({ class: 'avatar', src: url.avatar, alt: 'profile image' })
      ),
      span({ class: 'text' },
        span({ class: 'author' },
          a({ href: url.author }, name)
        ),
        span({ class: 'timestamp' }, ` ${timeAgo} ago`),
        isPrivate ? abbr({ title: 'Private' }, '🔒') : null
      )
    ),
    article({ class: 'content', innerHTML: markdownContent }),

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
        `❤ ${likeCount}`
        )
      ),
      a({ href: url.context }, 'context'),
      parentLink,
      a({ href: url.raw }, 'raw')
    )
    )

  return fragment
}
