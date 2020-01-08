'use strict'

const cooler = require('./lib/cooler')
const markdown = require('./lib/markdown')
const pull = require('pull-stream')

const nullImage = `&${'0'.repeat(43)}=.sha256`

module.exports = {
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
