'use strict'

const pull = require('pull-stream')
const { nav, ul, li, a } = require('hyperaxe')
const { themeNames } = require('@fraction/base16-css')
const debug = require('debug')('oasis')
const ssbMentions = require('ssb-mentions')
const ssbRef = require('ssb-ref')

const {
  about,
  blob,
  friend,
  meta,
  post,
  vote
} = require('./models')

const {
  authorView,
  commentView,
  listView,
  markdownView,
  metaView,
  publicView,
  replyView,
  searchView
} = require('./views')

let sharp

try {
  sharp = require('sharp')
} catch (e) {
  // Optional dependency
}

exports.author = async (feedId) => {
  const description = await about.description(feedId)
  const name = await about.name(feedId)
  const image = await about.image(feedId)
  const messages = await post.fromFeed(feedId)
  const relationship = await friend.getRelationship(feedId)

  const avatarUrl = `/image/256/${encodeURIComponent(image)}`

  return authorView({
    feedId,
    messages,
    name,
    description,
    avatarUrl,
    relationship
  })
}

exports.blob = async ({ blobId }) => {
  const bufferSource = await blob.get({ blobId })

  debug('got buffer source')
  return new Promise((resolve) => {
    pull(
      bufferSource,
      pull.collect(async (err, bufferArray) => {
        if (err) {
          await blob.want({ blobId })
          resolve(Buffer.alloc(0))
        } else {
          const buffer = Buffer.concat(bufferArray)
          resolve(buffer)
        }
      })
    )
  })
}

exports.comment = async (parentId) => {
  const parentMessage = await post.get(parentId)
  const myFeedId = await meta.myFeedId()

  const hasRoot = typeof parentMessage.value.content.root === 'string' && ssbRef.isMsg(parentMessage.value.content.root)
  const hasFork = typeof parentMessage.value.content.fork === 'string' && ssbRef.isMsg(parentMessage.value.content.fork)

  const rootMessage = hasRoot
    ? hasFork
      ? parentMessage
      : await post.get(parentMessage.value.content.root)
    : parentMessage

  const messages = await post.threadReplies(rootMessage.key)

  messages.push(rootMessage)

  return commentView({ messages, myFeedId, parentMessage })
}

exports.hashtag = async (channel) => {
  const messages = await post.fromHashtag(channel)

  return listView({ messages })
}

const fakePixel =
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64'
  )

const fakeImage = (imageSize) =>
  sharp
    ? sharp({
      create: {
        width: imageSize,
        height: imageSize,
        channels: 4,
        background: {
          r: 0, g: 0, b: 0, alpha: 0.5
        }
      }
    })
    : new Promise((resolve) => resolve(fakePixel))

const fakeId = '&0000000000000000000000000000000000000000000=.sha256'

exports.image = async ({ blobId, imageSize }) => {
  const bufferSource = await blob.get({ blobId })

  debug('got buffer source')
  return new Promise((resolve) => {
    if (blobId === fakeId) {
      debug('fake image')
      fakeImage(imageSize).then(result => resolve(result))
    } else {
      debug('not fake image')
      pull(
        bufferSource,
        pull.collect(async (err, bufferArray) => {
          if (err) {
            await blob.want({ blobId })
            const result = fakeImage(imageSize)
            debug({ result })
            resolve(result)
          } else {
            const buffer = Buffer.concat(bufferArray)

            if (sharp) {
              sharp(buffer)
                .resize(imageSize, imageSize)
                .png()
                .toBuffer()
                .then((data) => {
                  resolve(data)
                })
            } else {
              resolve(buffer)
            }
          }
        })
      )
    }
  })
}

exports.inbox = async () => {
  const messages = await post.inbox()

  return listView({ messages })
}

exports.json = async (message) => {
  const json = await meta.get(message)
  return JSON.stringify(json, null, 2)
}

exports.like = async ({ messageKey, voteValue }) => {
  const value = Number(voteValue)
  const message = await post.get(messageKey)

  const isPrivate = message.value.meta.private === true
  const messageRecipients = isPrivate ? message.value.content.recps : []

  const normalized = messageRecipients.map((recipient) => {
    if (typeof recipient === 'string') {
      return recipient
    }

    if (typeof recipient.link === 'string') {
      return recipient.link
    }

    return null
  })

  const recipients = normalized.length > 0 ? normalized : undefined

  return vote.publish({ messageKey, value, recps: recipients })
}

exports.likes = async ({ feed }) => {
  const messages = await post.likes({ feed })
  return listView({ messages })
}

exports.status = async (text) => {
  return markdownView({ text })
}

exports.mentions = async () => {
  const messages = await post.mentionsMe()

  return listView({ messages })
}

exports.meta = async ({ theme }) => {
  const status = await meta.status()
  const peers = await meta.peers()

  return metaView({ status, peers, theme, themeNames })
}

exports.profile = async () => {
  const myFeedId = await meta.myFeedId()

  const description = await about.description(myFeedId)
  const name = await about.name(myFeedId)
  const image = await about.image(myFeedId)

  const messages = await post.fromFeed(myFeedId)

  const avatarUrl = `/image/256/${encodeURIComponent(image)}`

  return authorView({
    feedId: myFeedId,
    messages,
    name,
    description,
    avatarUrl,
    relationship: null
  })
}

exports.publicLatest = async () => {
  const messages = await post.latest()
  return publicView({ messages })
}

exports.publicPopular = async ({ period }) => {
  const messages = await post.popular({ period })

  const option = (somePeriod) =>
    li(
      period === somePeriod
        ? a({ class: 'current', href: `./${somePeriod}` }, somePeriod)
        : a({ href: `./${somePeriod}` }, somePeriod)
    )

  const prefix = nav(
    ul(
      option('day'),
      option('week'),
      option('month'),
      option('year')
    )
  )

  return publicView({
    messages,
    prefix
  })
}

exports.publishComment = async ({ message, text }) => {
  // TODO: rename `message` to `parent` or `ancestor` or similar
  const mentions = ssbMentions(text).filter((mention) =>
    mention != null
  ) || undefined
  const parent = await meta.get(message)

  return post.comment({
    parent,
    message: { text, mentions }
  })
}

exports.publish = async ({ text }) => {
  const mentions = ssbMentions(text).filter((mention) =>
    mention != null
  ) || undefined

  return post.root({
    text,
    mentions
  })
}

exports.publishReply = async ({ message, text }) => {
  // TODO: rename `message` to `parent` or `ancestor` or similar
  const mentions = ssbMentions(text).filter((mention) =>
    mention != null
  ) || undefined

  const parent = await post.get(message)
  return post.reply({
    parent,
    message: { text, mentions }
  })
}

exports.reply = async (parentId) => {
  const rootMessage = await post.get(parentId)
  const myFeedId = await meta.myFeedId()

  debug('%O', rootMessage)
  const messages = [rootMessage]

  return replyView({ messages, myFeedId })
}

exports.search = async ({ query }) => {
  if (typeof query === 'string') {
    // https://github.com/ssbc/ssb-search/issues/7
    query = query.toLowerCase()
  }

  const messages = await post.search({ query })

  return searchView({ messages, query })
}

exports.thread = async (message) => {
  const messages = await post.fromThread(message)
  debug('got %i messages', messages.length)

  return listView({ messages })
}
