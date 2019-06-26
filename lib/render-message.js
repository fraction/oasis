const lodash = require('lodash')
const md = require('ssb-markdown')
const prettyMs = require('pretty-ms')
const pull = require('pull-stream')

const cooler = require('./cooler')
const toUrl = require('./to-url')

module.exports = (ssb) => async function (msg) {
  lodash.set(msg, 'value.meta.md.block', () =>
    md.block(msg.value.content.text, { toUrl: toUrl(msg) })
  )

  var filterQuery = {
    $filter: {
      dest: msg.key
    }
  }

  const whoami = await cooler.get(ssb.whoami)

  const backlinkStream = await cooler.read(ssb.backlinks.read, {
    query: [ filterQuery ],
    index: 'DTA', // use asserted timestamps
    reverse: true,
    private: true,
    meta: true
  })

  const votes = await new Promise((resolve, reject) => {
    pull(
      backlinkStream,
      pull.filter(ref =>
        typeof ref.value.content !== 'string' &&
        ref.value.content.type === 'vote' &&
        ref.value.content.vote &&
        ref.value.content.vote.link === msg.key
      ),
      pull.collect((err, msgs) => {
        if (err) return reject(err)
        resolve(msgs)
      })
    )
  })

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

  lodash.set(msg, 'value.meta.votes', votes)
  lodash.set(msg, 'value.meta.voted', votes.map(msg => msg.value.author).includes(whoami.id))

  return msg
}
