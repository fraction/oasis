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
    private: true,
    meta: true
  })

  const rawVotes = await new Promise((resolve, reject) => {
    pull(
      backlinkStream,
      pull.filter(ref =>
        typeof ref.value.content !== 'string' &&
        ref.value.content.type === 'vote' &&
        ref.value.content.vote &&
        typeof ref.value.content.vote.value === 'number' &&
        ref.value.content.vote.value >= 0 &&
        ref.value.content.vote.link === msg.key
      ),
      pull.collect((err, msgs) => {
        if (err) return reject(err)
        resolve(msgs)
      })
    )
  })

  // { @key: 1, @key2: 0, @key3: 1 }
  //
  // only one vote per person!
  const reducedVotes = rawVotes.reduce((acc, vote) => {
    acc[vote.value.author] = vote.value.content.vote.value
    return acc
  }, {})

  console.log(reducedVotes)

  // gets *only* the people who voted 1
  // [ @key, @key, @key ]
  const voters = Object.entries(reducedVotes).filter(e => e[1] === 1).map(e => e[0])

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

  lodash.set(msg, 'value.meta.votes', voters)
  lodash.set(msg, 'value.meta.voted', voters.includes(whoami.id))

  return msg
}
