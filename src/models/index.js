'use strict'

const debug = require('debug')('oasis')
const { isRoot, isReply } = require('ssb-thread-schema')
const lodash = require('lodash')
const prettyMs = require('pretty-ms')
const pullParallelMap = require('pull-paramap')
const pull = require('pull-stream')
const pullSort = require('pull-sort')

// HACK: https://github.com/ssbc/ssb-thread-schema/issues/4
const isNestedReply = require('ssb-thread-schema/post/nested-reply/validator')

const markdown = require('./markdown')

const nullImage = `&${'0'.repeat(43)}=.sha256`

const defaultOptions = {
  private: true,
  reverse: true,
  meta: true
}

const configure = (...customOptions) =>
  Object.assign({}, defaultOptions, ...customOptions)

module.exports = (cooler) => {
  const models = {}

  models.about = {
    name: async (feedId) => {
      const ssb = await cooler.connect()
      return cooler.get(
        ssb.about.socialValue, {
          key: 'name',
          dest: feedId
        }
      )
    },
    image: async (feedId) => {
      const ssb = await cooler.connect()
      const raw = await cooler.get(
        ssb.about.socialValue, {
          key: 'image',
          dest: feedId
        }
      )

      if (raw == null || raw.link == null) {
        return nullImage
      } if (typeof raw.link === 'string') {
        return raw.link
      }
      return raw
    },
    description: async (feedId) => {
      const ssb = await cooler.connect()
      const raw = await cooler.get(
        ssb.about.socialValue, {
          key: 'description',
          dest: feedId
        }
      )
      return markdown(raw)
    },
    all: async (feedId) => {
      const ssb = await cooler.connect()
      const raw = await cooler.read(
        ssb.about.read, {
          dest: feedId
        }
      )

      return new Promise((resolve, reject) =>
        pull(
          raw,
          pull.filter((message) => message.value.author === feedId),
          pull.reduce((acc, cur) => {
            const metaKeys = ['type', 'about']

            Object.entries(cur.value.content).filter(([key]) =>
              metaKeys.includes(key) === false
            ).forEach(([key, value]) => {
              acc[key] = value
            })

            return acc
          }, {}, (err, val) => {
            if (err) {
              reject(err)
            } else {
              resolve(val)
            }
          })
        )
      )
    }
  }

  models.blob = {
    get: async ({ blobId }) => {
      debug('get blob: %s', blobId)
      const ssb = await cooler.connect()
      return cooler.read(ssb.blobs.get, blobId)
    },
    want: async ({ blobId }) => {
      debug('want blob: %s', blobId)
      const ssb = await cooler.connect()

      // This does not wait for the blob.
      cooler.get(ssb.blobs.want, blobId)
    }
  }

  models.friend = {
    isFollowing: async (feedId) => {
      const ssb = await cooler.connect()
      const { id } = ssb

      const isFollowing = await cooler.get(
        ssb.friends.isFollowing,
        {
          source: id,
          dest: feedId
        }
      )
      return isFollowing
    },
    setFollowing: async ({ feedId, following }) => {
      const ssb = await cooler.connect()

      const content = {
        type: 'contact',
        contact: feedId,
        following
      }

      return cooler.get(ssb.publish, content)
    },
    follow: async (feedId) => {
      const isFollowing = await models.friend.isFollowing(feedId)
      if (!isFollowing) {
        await models.friend.setFollowing({ feedId, following: true })
      }
    },
    unfollow: async (feedId) => {
      const isFollowing = await models.friend.isFollowing(feedId)
      if (isFollowing) {
        await models.friend.setFollowing({ feedId, following: false })
      }
    },
    getRelationship: async (feedId) => {
      const ssb = await cooler.connect()
      const { id } = ssb

      if (feedId === id) {
        return 'this is you'
      }

      const isFollowing = await cooler.get(
        ssb.friends.isFollowing,
        {
          source: id,
          dest: feedId
        }
      )

      const isBlocking = await cooler.get(
        ssb.friends.isBlocking,
        {
          source: id,
          dest: feedId
        }
      )

      if (isFollowing === true && isBlocking === false) {
        return 'you are following'
      } else if (isFollowing === false && isBlocking === true) {
        return 'you are blocking'
      } else if (isFollowing === false && isBlocking === false) {
        return 'you are not following or blocking'
      } else {
        return 'you are following and blocking (!)'
      }
    }

  }

  models.meta = {
    myFeedId: async () => {
      const ssb = await cooler.connect()
      const { id } = ssb
      return id
    },
    get: async (msgId) => {
      const ssb = await cooler.connect()
      return cooler.get(ssb.get, {
        id: msgId,
        meta: true,
        private: true
      })
    },
    status: async () => {
      const ssb = await cooler.connect()
      return cooler.get(ssb.status)
    },
    peers: async () => {
      const ssb = await cooler.connect()
      const peersSource = await cooler.read(ssb.conn.peers)

      return new Promise((resolve, reject) => {
        pull(
          peersSource,
          // https://github.com/staltz/ssb-conn/issues/9
          pull.take(1),
          pull.collect((err, val) => {
            if (err) return reject(err)
            resolve(val[0])
          })
        )
      })
    }
  }

  const isPost = (message) =>
    lodash.get(message, 'value.content.type') === 'post' &&
      lodash.get(message, 'value.content.text') != null

  const isLooseRoot = (message) => {
    const conditions = [
      isPost(message),
      lodash.get(message, 'value.content.root') == null,
      lodash.get(message, 'value.content.fork') == null
    ]

    return conditions.every(x => x)
  }

  const isLooseReply = (message) => {
    const conditions = [
      isPost(message),
      lodash.get(message, 'value.content.root') != null,
      lodash.get(message, 'value.content.fork') != null
    ]

    return conditions.every(x => x)
  }

  const isLooseComment = (message) => {
    const conditions = [
      isPost(message),
      lodash.get(message, 'value.content.root') != null,
      lodash.get(message, 'value.content.fork') == null
    ]

    return conditions.every(x => x === true)
  }

  const maxMessages = 64

  const getMessages = async ({ myFeedId, customOptions, ssb, query, filter = null }) => {
    const options = configure({ query, index: 'DTA' }, customOptions)

    const source = await cooler.read(
      ssb.backlinks.read, options
    )

    return new Promise((resolve, reject) => {
      pull(
        source,
        pull.filter((msg) =>
          typeof msg.value.content !== 'string' &&
    msg.value.content.type === 'post' &&
    (filter == null || filter(msg) === true)
        ),
        pull.take(maxMessages),
        pull.collect((err, collectedMessages) => {
          if (err) {
            reject(err)
          } else {
            resolve(transform(ssb, collectedMessages, myFeedId))
          }
        })
      )
    })
  }

  const transform = (ssb, messages, myFeedId) =>
    Promise.all(messages.map(async (msg) => {
      debug('transforming %s', msg.key)

      if (msg == null) {
        return null
      }

      lodash.set(msg, 'value.meta.md.block', () =>
        markdown(msg.value.content.text, msg.value.content.mentions)
      )

      const filterQuery = {
        $filter: {
          dest: msg.key
        }
      }

      const referenceStream = await cooler.read(ssb.backlinks.read, {
        query: [filterQuery],
        index: 'DTA', // use asserted timestamps
        private: true,
        meta: true
      })

      const rawVotes = await new Promise((resolve, reject) => {
        pull(
          referenceStream,
          pull.filter((ref) => typeof ref.value.content !== 'string' &&
      ref.value.content.type === 'vote' &&
      ref.value.content.vote &&
      typeof ref.value.content.vote.value === 'number' &&
      ref.value.content.vote.value >= 0 &&
      ref.value.content.vote.link === msg.key),
          pull.collect((err, collectedMessages) => {
            if (err) {
              reject(err)
            } else {
              resolve(collectedMessages)
            }
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
      const voters = Object
        .entries(reducedVotes)
        .filter(([, value]) => value === 1)
        .map(([key]) => key)

      const pendingName = cooler.get(
        ssb.about.socialValue, {
          key: 'name',
          dest: msg.value.author
        }
      )

      const pendingAvatarMsg = cooler.get(
        ssb.about.socialValue, {
          key: 'image',
          dest: msg.value.author
        }
      )

      const pending = [pendingName, pendingAvatarMsg]
      const [name, avatarMsg] = await Promise.all(pending)

      const avatarId = avatarMsg != null && typeof avatarMsg.link === 'string'
        ? avatarMsg.link || nullImage
        : avatarMsg || nullImage

      const avatarUrl = `/image/64/${encodeURIComponent(avatarId)}`

      const ts = new Date(msg.value.timestamp)
      let isoTs

      try {
        isoTs = ts.toISOString()
      } catch (e) {
        // Just in case it's an invalid date. :(
        debug(e)
        const receivedTs = new Date(msg.timestamp)
        isoTs = receivedTs.toISOString()
      }

      lodash.set(msg, 'value.meta.timestamp.received.iso8601', isoTs)

      const ago = Date.now() - Number(ts)
      const prettyAgo = prettyMs(ago, { compact: true })
      lodash.set(msg, 'value.meta.timestamp.received.since', prettyAgo)
      lodash.set(msg, 'value.meta.author.name', name)
      lodash.set(msg, 'value.meta.author.avatar', {
        id: avatarId,
        url: avatarUrl
      })

      const isPost = lodash.get(msg, 'value.content.type') === 'post' && lodash.get(msg, 'value.content.text') != null
      const hasRoot = lodash.get(msg, 'value.content.root') != null
      const hasFork = lodash.get(msg, 'value.content.fork') != null

      if (isPost && hasRoot === false && hasFork === false) {
        lodash.set(msg, 'value.meta.postType', 'post')
      } else if (isPost && hasRoot && hasFork === false) {
        lodash.set(msg, 'value.meta.postType', 'comment')
      } else if (isPost && hasRoot && hasFork) {
        lodash.set(msg, 'value.meta.postType', 'reply')
      } else {
        lodash.set(msg, 'value.meta.postType', 'mystery')
      }

      lodash.set(msg, 'value.meta.votes', voters)
      lodash.set(msg, 'value.meta.voted', voters.includes(myFeedId))

      return msg
    }))

  const post = {
    fromFeed: async (feedId, customOptions = {}) => {
      const ssb = await cooler.connect()

      const myFeedId = ssb.id

      const options = configure({ id: feedId }, customOptions)
      const source = await cooler.read(
        ssb.createUserStream,
        options
      )

      const messages = await new Promise((resolve, reject) => {
        pull(
          source,
          pull.filter((msg) => typeof msg.value.content !== 'string' &&
      msg.value.content.type === 'post'),
          pull.take(maxMessages),
          pull.collect((err, collectedMessages) => {
            if (err) {
              reject(err)
            } else {
              resolve(transform(ssb, collectedMessages, myFeedId))
            }
          })
        )
      })

      return messages
    },
    mentionsMe: async (customOptions = {}) => {
      const ssb = await cooler.connect()

      const myFeedId = ssb.id

      const query = [{
        $filter: {
          dest: myFeedId
        }
      }]

      const messages = await getMessages({
        myFeedId,
        customOptions,
        ssb,
        query,
        filter: (msg) => msg.value.author !== myFeedId
      })

      return messages
    },
    fromHashtag: async (hashtag, customOptions = {}) => {
      const ssb = await cooler.connect()

      const myFeedId = ssb.id

      const query = [{
        $filter: {
          dest: `#${hashtag}`
        }
      }]

      const messages = await getMessages({ myFeedId, customOptions, ssb, query })

      return messages
    },
    threadReplies: async (rootId, customOptions = {}) => {
      const ssb = await cooler.connect()

      const myFeedId = ssb.id

      const query = [{
        $filter: {
          dest: rootId
        }
      }]

      const messages = await getMessages({
        myFeedId,
        customOptions,
        ssb,
        query,
        filter: (msg) =>
          msg.value.content.root === rootId &&
  msg.value.content.fork == null
      })

      return messages
    },
    likes: async ({ feed }, customOptions = {}) => {
      const ssb = await cooler.connect()

      const query = [{
        $filter: {
          value: {
            author: feed,
            content: {
              type: 'vote'
            }
          }
        }
      }]

      const options = configure({
        query,
        index: 'DTA',
        reverse: true
      }, customOptions)

      const source = await cooler.read(
        ssb.query.read, options
      )

      const messages = await new Promise((resolve, reject) => {
        pull(
          source,
          pull.filter((msg) => {
            return typeof msg.value.content === 'object' &&
        msg.value.author === feed &&
        typeof msg.value.content.vote === 'object' &&
        typeof msg.value.content.vote.link === 'string'
          }),
          pull.take(maxMessages),
          pullParallelMap(async (val, cb) => {
            const msg = await post.get(val.value.content.vote.link)
            cb(null, msg)
          }),
          pull.collect((err, collectedMessages) => {
            if (err) {
              reject(err)
            } else {
              resolve(collectedMessages)
            }
          })
        )
      })

      return messages
    },
    search: async ({ query }) => {
      const ssb = await cooler.connect()

      const myFeedId = ssb.id

      const options = configure({
        query
      })

      const source = await cooler.read(
        ssb.search.query,
        options
      )

      const messages = await new Promise((resolve, reject) => {
        pull(
          source,
          pull.filter((message) => // avoid private messages (!)
            typeof message.value.content !== 'string'
          ),
          pull.take(maxMessages),
          pull.collect((err, collectedMessages) => {
            if (err) {
              reject(err)
            } else {
              resolve(transform(ssb, collectedMessages, myFeedId))
            }
          })
        )
      })

      return messages
    },
    latest: async () => {
      const ssb = await cooler.connect()

      const myFeedId = ssb.id

      const options = configure({
        type: 'post',
        private: false
      })

      const source = await cooler.read(
        ssb.messagesByType,
        options
      )

      const messages = await new Promise((resolve, reject) => {
        pull(
          source,
          pull.filter((message) => // avoid private messages (!)
            typeof message.value.content !== 'string'
          ),
          pull.take(maxMessages),
          pull.collect((err, collectedMessages) => {
            if (err) {
              reject(err)
            } else {
              resolve(transform(ssb, collectedMessages, myFeedId))
            }
          })
        )
      })

      return messages
    },
    popular: async ({ period }) => {
      const ssb = await cooler.connect()

      const periodDict = {
        day: 1,
        week: 7,
        month: 30.42,
        year: 365
      }

      if (period in periodDict === false) {
        throw new Error('invalid period')
      }

      const myFeedId = ssb.id

      const now = new Date()
      const earliest = Number(now) - (1000 * 60 * 60 * 24 * periodDict[period])

      const options = configure({
        type: 'vote',
        gt: earliest,
        private: false
      })

      const source = await cooler.read(
        ssb.messagesByType,
        options
      )

      const messages = await new Promise((resolve, reject) => {
        pull(
          source,
          pull.filter((msg) => {
            return typeof msg.value.content === 'object' &&
        typeof msg.value.content.vote === 'object' &&
        typeof msg.value.content.vote.link === 'string' &&
        typeof msg.value.content.vote.value === 'number' &&
        msg.value.timestamp > earliest
          }),
          pull.reduce((acc, cur) => {
            const author = cur.value.author
            const target = cur.value.content.vote.link
            const value = cur.value.content.vote.value

            if (acc[author] == null) {
              acc[author] = {}
            }

            // Only accept values between -1 and 1
            acc[author][target] = Math.max(-1, Math.min(1, value))

            return acc
          }, {}, (err, obj) => {
            if (err) {
              return reject(err)
            }

            // HACK: Can we do this without a reduce()? I think this makes the
            // stream much slower than it needs to be. Also, we should probably
            // be indexing these rather than building the stream on refresh.

            const adjustedObj = Object.entries(obj)
              .reduce(
                (acc, [author, values]) => {
                  if (author === myFeedId) {
                    return acc
                  }

                  const entries = Object.entries(values)
                  const total = 1 + Math.log(entries.length)

                  entries.forEach(([link, value]) => {
                    if (acc[link] == null) {
                      acc[link] = 0
                    }
                    acc[link] += value / total
                  })
                  return acc
                },
                []
              )

            const arr = Object.entries(adjustedObj)
            const length = arr.length

            pull(
              pull.values(arr),
              pullSort(([, aVal], [, bVal]) =>
                bVal - aVal
              ),
              pull.take(Math.min(length, maxMessages)),
              pull.map(([key]) => key),
              pullParallelMap(async (key, cb) => {
                try {
                  const msg = await post.get(key)
                  cb(null, msg)
                } catch (e) {
                  cb(null, null)
                }
              }),
              pull.filter((message) => // avoid private messages (!)
                message &&
    typeof message.value.content !== 'string'
              ),
              pull.collect((err, collectedMessages) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(transform(ssb, collectedMessages, myFeedId))
                }
              })
            )
          })
        )
      })

      return messages
    },
    fromThread: async (msgId, customOptions) => {
      debug('thread: %s', msgId)
      const ssb = await cooler.connect()

      const myFeedId = ssb.id

      const options = configure({ id: msgId }, customOptions)
      const rawMsg = await cooler.get(ssb.get, options)

      debug('got raw message')

      const parents = []

      const getRootAncestor = (msg) => new Promise((resolve, reject) => {
        if (msg.key == null) {
          debug('something is very wrong, we used `{ meta: true }`')
          resolve(parents)
        } else {
          debug('getting root ancestor of %s', msg.key)

          if (typeof msg.value.content === 'string') {
            debug('private message')
            // Private message we can't decrypt, stop looking for parents.
            resolve(parents)
          }

          if (msg.value.content.type !== 'post') {
            debug('not a post')
            resolve(msg)
          }

          if (isLooseReply(msg)) {
            debug('reply, get the parent')
            try {
              // It's a message reply, get the parent!
              cooler.get(ssb.get, {
                id: msg.value.content.fork,
                meta: true,
                private: true
              }).then((fork) => {
                resolve(getRootAncestor(fork))
              }).catch(reject)
            } catch (e) {
              debug(e)
              resolve(msg)
            }
          } else if (isLooseComment(msg)) {
            debug('comment: %s', msg.value.content.root)
            try {
              // It's a thread reply, get the parent!
              cooler.get(ssb.get, {
                id: msg.value.content.root,
                meta: true,
                private: true
              }).then((root) => {
                resolve(getRootAncestor(root))
              }).catch(reject)
            } catch (e) {
              debug(e)
              resolve(msg)
            }
          } else if (isLooseRoot(msg)) {
            debug('got root ancestor')
            resolve(msg)
          } else {
            // type !== "post", probably
            // this should show up as JSON
            debug('got mysterious root ancestor that fails all known schemas')
            debug('%O', msg)
            resolve(msg)
          }
        }
      })

      const getReplies = (key) => new Promise((resolve, reject) => {
        const filterQuery = {
          $filter: {
            dest: key
          }
        }

        cooler.read(ssb.backlinks.read, {
          query: [filterQuery],
          index: 'DTA' // use asserted timestamps
        }).then((referenceStream) => {
          pull(
            referenceStream,
            pull.filter((msg) => {
              const isPost = lodash.get(msg, 'value.content.type') === 'post'
              if (isPost === false) {
                return false
              }

              const root = lodash.get(msg, 'value.content.root')
              const fork = lodash.get(msg, 'value.content.fork')

              if (root !== key && fork !== key) {
                // mention
                return false
              }

              if (fork === key) {
                // not a reply to this post
                // it's a reply *to a reply* of this post
                return false
              }

              return true
            }),
            pull.collect((err, messages) => {
              if (err) {
                reject(err)
              } else {
                resolve(messages || undefined)
              }
            })
          )
        }).catch(reject)
      })

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
      const flattenDeep = (arr1) => arr1.reduce(
        (acc, val) => (Array.isArray(val)
          ? acc.concat(flattenDeep(val))
          : acc.concat(val)
        ),
        []
      )

      const getDeepReplies = (key) => new Promise((resolve, reject) => {
        const oneDeeper = async (replyKey, depth) => {
          const replies = await getReplies(replyKey)
          debug('replies', replies.map((m) => m.key))

          debug('found %s replies for %s', replies.length, replyKey)

          if (replies.length === 0) {
            return replies
          }
          return Promise.all(replies.map(async (reply) => {
            const deeperReplies = await oneDeeper(reply.key, depth + 1)
            lodash.set(reply, 'value.meta.thread.depth', depth)
            lodash.set(reply, 'value.meta.thread.reply', true)
            return [reply, deeperReplies]
          }))
        }
        oneDeeper(key, 0).then((nested) => {
          const nestedReplies = [...nested]
          const deepReplies = flattenDeep(nestedReplies)
          resolve(deepReplies)
        }).catch(reject)
      })

      debug('about to get root ancestor')
      const rootAncestor = await getRootAncestor(rawMsg)
      debug('got root ancestors')
      const deepReplies = await getDeepReplies(rootAncestor.key)
      debug('got deep replies')

      const allMessages = [rootAncestor, ...deepReplies].map((message) => {
        const isThreadTarget = message.key === msgId
        lodash.set(message, 'value.meta.thread.target', isThreadTarget)
        return message
      })

      const transformed = await transform(ssb, allMessages, myFeedId)
      return transformed
    },
    get: async (msgId, customOptions) => {
      debug('get: %s', msgId)
      const ssb = await cooler.connect()

      const myFeedId = ssb.id

      const options = configure({ id: msgId }, customOptions)
      const rawMsg = await cooler.get(ssb.get, options)
      debug('got raw message')

      const transformed = await transform(ssb, [rawMsg], myFeedId)
      debug('transformed: %O', transformed)
      return transformed[0]
    },
    publish: async (options) => {
      const ssb = await cooler.connect()
      const body = { type: 'post', ...options }

      debug('Published: %O', body)
      return cooler.get(ssb.publish, body)
    },
    reply: async ({ parent, message }) => {
      message.root = parent.key
      message.fork = lodash.get(parent, 'value.content.root')
      message.branch = await post.branch({ root: parent.key })
      message.type = 'post' // redundant but used for validation

      if (isNestedReply(message) !== true) {
        const messageString = JSON.stringify(message, null, 2)
        throw new Error(`message should be valid reply: ${messageString}`)
      }

      return post.publish(message)
    },
    root: async (options) => {
      const message = { type: 'post', ...options }

      if (isRoot(message) !== true) {
        const messageString = JSON.stringify(message, null, 2)
        throw new Error(`message should be valid root post: ${messageString}`)
      }

      return post.publish(message)
    },
    comment: async ({ parent, message }) => {
      // Set `root` to `parent`'s root.
      // If `parent` doesn't have a root, use the parent's key.
      // If `parent` has a fork, you must use the parent's key.
      const parentKey = parent.key
      const parentFork = lodash.get(parent, 'value.content.fork')
      const parentRoot = lodash.get(parent, 'value.content.root', parentKey)

      const isPrivate = lodash.get(parent, 'value.meta.private', false)

      if (isPrivate) {
        // We default to `null` in case something goes wrong and we receive a
        // private message with no `recps` somehow. This adds a layer of security
        // because SSB-DB won't let us publish a message with `{ recps: null }`.
        message.recps = lodash.get(parent, 'value.content.recps', null)
      }

      const parentHasFork = parentFork != null

      message.root = parentHasFork ? parentKey : parentRoot
      message.branch = await post.branch({ root: parent.key })
      message.type = 'post' // redundant but used for validation

      if (isReply(message) !== true) {
        const messageString = JSON.stringify(message, null, 2)
        throw new Error(`message should be valid comment: ${messageString}`)
      }

      return post.publish(message)
    },
    branch: async ({ root }) => {
      const ssb = await cooler.connect()
      const keys = await cooler.get(ssb.tangle.branch, root)

      return keys
    },
    inbox: async (customOptions = {}) => {
      const ssb = await cooler.connect()

      const myFeedId = ssb.id

      const options = configure({
        type: 'post'
      }, customOptions)

      const source = await cooler.read(
        ssb.messagesByType,
        options
      )

      const messages = await new Promise((resolve, reject) => {
        pull(
          source,
          pull.filter((message) => // avoid private messages (!)
            typeof message.value.content !== 'string' &&
      lodash.get(message, 'value.meta.private')
          ),
          pull.unique((message) => {
            const { root } = message.value.content
            if (root == null) {
              return message.key
            } else {
              return root
            }
          }),
          pull.take(maxMessages),
          pull.collect((err, collectedMessages) => {
            if (err) {
              reject(err)
            } else {
              resolve(transform(ssb, collectedMessages, myFeedId))
            }
          })
        )
      })

      return messages
    }
  }
  models.post = post

  models.vote = {
    publish: async ({ messageKey, value, recps }) => {
      const ssb = await cooler.connect()
      const branch = await cooler.get(ssb.tangle.branch, messageKey)

      await cooler.get(ssb.publish, {
        type: 'vote',
        vote: {
          link: messageKey,
          value: Number(value)
        },
        branch,
        recps
      })
    }
  }

  return models
}
