const ssbRef = require('ssb-ref')
const ssbMsgs = require('ssb-msgs')
const lodash = require('lodash')

module.exports = (msg) => {
  var mentionNames = {}

  const mentions = lodash.get(msg, 'value.content.mentions', [])

  ssbMsgs.links(mentions, 'feed').forEach(function (link) {
    if (link.name && typeof link.name === 'string') {
      var name = (link.name.charAt(0) === '@') ? link.name : '@' + link.name
      mentionNames[name] = link.link
    }
  })

  return (ref, isImage) => {
    // @mentions
    if (ref in mentionNames) {
      return '/author/' + encodeURIComponent(mentionNames[ref])
    }

    if (ssbRef.isFeedId(ref)) {
      return '/author/' + encodeURIComponent(ref)
    } else if (ssbRef.isMsgId(ref)) {
      return '/thread/' + encodeURIComponent(ref)
    } else if (ssbRef.isBlobId(ref)) {
      return 'http://localhost:8989/blobs/get/' + encodeURIComponent(ref)
    } else if (ref && ref[0] === '#') {
      return '/hashtag/' + encodeURIComponent(ref.substr(1))
    }
    return ''
  }
}
