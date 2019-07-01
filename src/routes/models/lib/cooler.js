const ssbClient = require('ssb-client')
const secretStack = require('secret-stack')
const ssbConfig = require('ssb-config')
const debug = require('debug')('oasis')

const db = {
  connect: function () {
    return new Promise((resolve, reject) => {
      ssbClient((err, api) => {
        if (err) reject(err)
        resolve(api)
      })
    })
  },
  /**
   * @param {function} method
   */
  get: function (method, ...opts) {
    return new Promise((resolve, reject) => {
      method(...opts, (err, val) => {
        if (err) return reject(err)
        resolve(val)
      })
    })
  },
  read: function (method, ...args) {
    return new Promise((resolve, reject) => {
      resolve(method(...args))
    })
  }
}

debug.enabled = true
db.connect().then(() =>
  debug('Using pre-existing Scuttlebutt server instead of starting one')
).catch(() => {
  debug('Starting Scuttlebutt server')

  const server = secretStack()

  server
    .use(require('ssb-db'))
    .use(require('ssb-onion'))
    .use(require('ssb-unix-socket'))
    .use(require('ssb-no-auth'))
    .use(require('ssb-plugins'))
    .use(require('ssb-master'))
    .use(require('ssb-gossip'))
    .use(require('ssb-replicate'))
    .use(require('ssb-friends'))
    .use(require('ssb-blobs'))
    .use(require('ssb-invite'))
    .use(require('ssb-local'))
    .use(require('ssb-logging'))
    .use(require('ssb-query'))
    .use(require('ssb-links'))
    .use(require('ssb-ws'))
    .use(require('ssb-ebt'))
    .use(require('ssb-ooo'))
    .use(require('ssb-backlinks'))
    .use(require('ssb-about'))

  server(ssbConfig)
})

module.exports = db
