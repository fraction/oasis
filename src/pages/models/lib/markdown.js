'use strict'

const md = require('ssb-markdown')
const ssbMessages = require('ssb-msgs')
const ssbRef = require('ssb-ref')

const toUrl = (mentions = []) => {
  const mentionNames = {}

  ssbMessages.links(mentions, 'feed').forEach((link) => {
    if (link.name && typeof link.name === 'string') {
      const name = (link.name.charAt(0) === '@') ? link.name : `@${link.name}`
      mentionNames[name] = link.link
    }
  })

  return (ref, isImage) => {
    // @mentions
    if (ref in mentionNames) {
      return `/author/${encodeURIComponent(mentionNames[ref])}`
    }

    if (ssbRef.isFeedId(ref)) {
      return `/author/${encodeURIComponent(ref)}`
    } if (ssbRef.isMsgId(ref)) {
      return `/thread/${encodeURIComponent(ref)}`
    } if (ssbRef.isBlobId(ref)) {
      return `/blob/${encodeURIComponent(ref)}`
    } if (ref && ref[0] === '#') {
      return `/hashtag/${encodeURIComponent(ref.substr(1))}`
    }
    return ''
  }
}

module.exports = (input, mentions) => md.block(input, {
  toUrl: toUrl(mentions)
})
