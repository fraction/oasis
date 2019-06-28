const {
  a,
  abbr,
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

  const name = msg.value.meta.author.name
  const timeAgo = msg.value.meta.timestamp.received.since

  const depth = lodash.get(msg, 'value.meta.thread.depth')

  const markdownContent = msg.value.meta.md.block()

  const likeButton = msg.value.meta.voted
    ? { value: 0, class: 'liked' }
    : { value: 1, class: null }

  const likeCount = msg.value.meta.votes.length

  const parentLink = msg.value.content.root != null
    ? a({ href: url.parent }, 'parent')
    : null

  const fragment =
    section({
      id: msg.key,
      class: 'message',
      style: `margin-left: ${depth * 1.5}rem`
    },
    header(
      a({ href: url.author },
        img({ class: 'avatar', src: url.avatar })
      ),
      span({ class: 'text' },
        span({ class: 'author' },
          a({ href: url.author }, name)
        ),
        span({ class: 'timestamp' }, ` (${timeAgo})`),
        isPrivate ? abbr({ title: 'Private' }, '🔒') : null
      )
    ),
    article({ class: 'content', innerHTML: markdownContent }),
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
