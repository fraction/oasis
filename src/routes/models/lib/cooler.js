const ssbClient = require('ssb-client')
const secretStack = require('secret-stack')
const ssbConfig = require('ssb-config')

const server = secretStack()

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

db.connect().then(() =>
  console.log('Using pre-existing Scuttlebutt server instead of starting one')
).catch(() => {
  console.log('Starting Scuttlebutt server')

  server
    .use(require('ssb-db'))
    .use(require('ssb-master'))
    .use(require('ssb-gossip'))
    .use(require('ssb-replicate'))
    .use(require('ssb-backlinks'))
    .use(require('ssb-about'))
    .use(require('ssb-blobs'))
    .use(require('ssb-ws'))
  server(ssbConfig)
})

module.exports = db
