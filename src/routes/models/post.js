const lodash = require('lodash')
const pull = require('pull-stream')

const cooler = require('./lib/cooler')
const configure = require('./lib/configure')
const markdown = require('./lib/markdown')
const prettyMs = require('pretty-ms')

const transform = (ssb, messages) => Promise.all(messages.map(async (msg) => {
  lodash.set(msg, 'value.meta.md.block', () =>
    markdown(msg.value.content.text, msg.value.content.mentions)
  )

  var filterQuery = {
    $filter: {
      dest: msg.key
    }
  }

  const whoami = await cooler.get(ssb.whoami)

  const referenceStream = await cooler.read(ssb.backlinks.read, {
    query: [ filterQuery ],
    index: 'DTA', // use asserted timestamps
    private: true,
    meta: true
  })

  const rawVotes = await new Promise((resolve, reject) => {
    pull(
      referenceStream,
      pull.filter(ref =>
        typeof ref.value.content !== 'string' &&
        ref.value.content.type === 'vote' &&
        ref.value.content.vote &&
        typeof ref.value.content.vote.value === 'number' &&
        ref.value.content.vote.value >= 0 &&
        ref.value.content.vote.link === msg.key
      ),
      pull.collect((err, messages) => {
        if (err) return reject(err)
        resolve(messages)
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
}))

module.exports = {
  fromFeed: async (feedId, customOptions = {}) => {
    const ssb = await cooler.connect()
    const options = configure({ id: feedId }, customOptions)

    const source = await cooler.read(
      ssb.createUserStream,
      options
    )

    const messages = await new Promise((resolve, reject) => {
      pull(
        source,
        pull.filter(msg =>
          typeof msg.value.content !== 'string' &&
          msg.value.content.type === 'post'
        ),
        pull.take(32),
        pull.collect((err, messages) => {
          if (err) return reject(err)
          resolve(transform(ssb, messages))
        })
      )
    })

    return messages
  },
  fromHashtag: async (hashtag, customOptions = {}) => {
    const ssb = await cooler.connect()
    const query = [ {
      $filter: {
        dest: '#' + hashtag
      }
    } ]

    const options = configure({ query, index: 'DTA' }, customOptions)

    const source = await cooler.read(
      ssb.backlinks.read, options
    )

    const messages = await new Promise((resolve, reject) => {
      pull(
        source,
        pull.filter(msg =>
          typeof msg.value.content !== 'string' &&
          msg.value.content.type === 'post'
        ),
        pull.take(32),
        pull.collect((err, messages) => {
          if (err) return reject(err)
          resolve(transform(ssb, messages))
        })
      )
    })

    return messages
  },
  latest: async (customOptions = {}) => {
    const ssb = await cooler.connect()
    const options = configure({
      type: 'post',
      limit: 32
    }, customOptions)

    const source = await cooler.read(
      ssb.messagesByType,
      options
    )

    const messages = await new Promise((resolve, reject) => {
      pull(
        source,
        pull.collect((err, messages) => {
          if (err) return reject(err)
          resolve(transform(ssb, messages))
        })
      )
    })

    return messages
  },
  fromThread: async (msgId, customOptions) => {
    const ssb = await cooler.connect()
    const options = configure({ id: msgId }, customOptions)
    const rawMsg = await cooler.get(ssb.get, options)

    const parents = []

    const getParents = (msg) => new Promise(async (resolve, reject) => {
      if (typeof msg.value.content === 'string') {
        return resolve(parents)
      }

      if (typeof msg.value.content.fork === 'string') {
        const fork = await cooler.get(ssb.get, {
          id: msg.value.content.fork,
          meta: true,
          private: true
        })

        parents.push(fork)
        resolve(getParents(fork))
      } else if (typeof msg.value.content.root === 'string') {
        const root = await cooler.get(ssb.get, {
          id: msg.value.content.root,
          meta: true,
          private: true
        })

        parents.push(root)
        resolve(getParents(root))
      } else {
        resolve(parents)
      }
    })

    const ancestors = await getParents(rawMsg)

    const root = rawMsg.key

    var filterQuery = {
      $filter: {
        dest: root
      }
    }

    const referenceStream = await cooler.read(ssb.backlinks.read, {
      query: [filterQuery],
      index: 'DTA' // use asserted timestamps
    })

    const replies = await new Promise((resolve, reject) =>
      pull(
        referenceStream,
        pull.filter(msg => {
          const isPost = lodash.get(msg, 'value.content.type') === 'post'
          if (isPost === false) {
            return false
          }

          const root = lodash.get(msg, 'value.content.root')
          const fork = lodash.get(msg, 'value.content.fork')

          if (root !== rawMsg.key && fork !== rawMsg.key) {
            // mention
            return false
          }

          return true
        }
        ),
        pull.collect((err, messages) => {
          if (err) return reject(err)
          resolve(messages)
        })
      )
    )

    const allMessages = [...ancestors, rawMsg, ...replies]
    return transform(ssb, allMessages)
  }
}
