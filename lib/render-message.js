const lodash = require('lodash')
const md = require('ssb-markdown')
const prettyMs = require('pretty-ms')

const cooler = require('./cooler')
const toUrl = require('./to-url')

module.exports = (ssb) => async function (msg) {
  lodash.set(msg, 'value.meta.md.block', () =>
    md.block(msg.value.content.text, { toUrl: toUrl(msg) })
  )

  const name = await cooler.get(
    ssb.about.socialValue, { key: 'name',
      dest: msg.value.author
    }
  )

  const avatarMsg = await cooler.get(
    ssb.about.socialValue, { key: 'image',
      dest: msg.value.author
    }
  )

  const avatarId = avatarMsg != null && typeof avatarMsg.link === 'string'
    ? avatarMsg.link
    : avatarMsg

  const avatarUrl = `http://localhost:8989/blobs/get/${avatarId}`

  const ts = new Date(msg.value.timestamp)
  lodash.set(msg, 'value.meta.timestamp.received.iso8601', ts.toISOString())

  const ago = Date.now() - Number(ts)
  lodash.set(msg, 'value.meta.timestamp.received.since', prettyMs(ago, { compact: true }))
  lodash.set(msg, 'value.meta.author.name', name)
  lodash.set(msg, 'value.meta.author.avatar', {
    id: avatarId,
    url: avatarUrl
  })

  return msg
}
