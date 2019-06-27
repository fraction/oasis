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

module.exports = ({ msg }) => {
  const encodedKey = encodeURIComponent(msg.key)
  const url = {
    author: `/author/${encodeURIComponent(msg.value.author)}`,
    likeForm: `/like/${encodedKey}`,
    context: `/thread/${encodedKey}#${encodedKey}`,
    avatar: msg.value.meta.author.avatar.url,
    raw: `raw/${encodedKey}`
  }

  const isPrivate = Boolean(msg.value.meta.private)

  const name = msg.value.meta.author.name
  const approxTimeAgo = msg.value.meta.timestamp.received.since

  const markdownContent = msg.value.meta.md.block()

  const likeButtonValue = msg.value.meta.voted
    ? 0
    : 1

  const likeButtonClass = msg.value.meta.voted
    ? 'liked'
    : null

  const likeCount = msg.value.meta.votes.length

  const fragment =
  section({ id: msg.key, class: 'message' },
    header(
      a({ href: url.author },
        img({ class: 'avatar', src: url.avatar })
      ),
      span({ class: 'text' },
        span({ class: 'author' },
          a({ href: url.author }, name)
        ),
        span({ class: 'timestamp' }, ` (${approxTimeAgo})`),
        isPrivate ? abbr({ title: 'Private' }, '🔒') : null
      )
    ),
    article({ class: 'content', innerHTML: markdownContent }),
    footer(
      form({ action: url.likeForm, method: 'post' },
        button({
          name: 'voteValue',
          type: 'submit',
          value: likeButtonValue,
          class: likeButtonClass
        },
        `❤ ${likeCount}`
        )
      ),
      a({ href: url.context }, 'context'),
      a({ href: url.raw }, 'raw')
    )
  )

  return fragment
}
