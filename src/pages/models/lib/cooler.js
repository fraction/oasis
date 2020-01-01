'use strict'

const debug = require('debug')('oasis')
const ssbClient = require('ssb-client')

const rawConnect = () => new Promise((resolve, reject) => {
  ssbClient({
    manifest: {
      about: {
        socialValue: 'async',
        read: 'source'
      },
      backlinks: { read: 'source' },
      blobs: {
        get: 'source',
        ls: 'source',
        want: 'async'
      },
      conn: {
        peers: 'source'
      },
      createUserStream: 'source',
      createHistoryStream: 'source',
      get: 'sync',
      messagesByType: 'source',
      publish: 'async',
      status: 'async',
      tangle: { branch: 'async' },
      query: { read: 'source' },
      friends: {
        isFollowing: 'async',
        isBlocking: 'async'
      },
      search: {
        query: 'source'
      }
    }
  }, (err, api) => {
    if (err) {
      reject(err)
    } else {
      resolve(api)
    }
  })
})

const db = {
  connect () {
    return handle
  },
  /**
   * @param {function} method
   */
  get (method, ...opts) {
    return new Promise((resolve, reject) => {
      method(...opts, (err, val) => {
        if (err) {
          reject(err)
        } else {
          resolve(val)
        }
      })
    })
  },
  read (method, ...args) {
    return new Promise((resolve) => {
      resolve(method(...args))
    })
  }
}

debug.enabled = true

const handle = new Promise((resolve) => {
  rawConnect().then((ssb) => {
    debug('Using pre-existing Scuttlebutt server instead of starting one')
    resolve(ssb)
  }).catch(() => {
    debug('Initial connection attempt failed')
    debug('Starting Scuttlebutt server')
    require('./server')
    const connectOrRetry = () => {
      rawConnect().then((ssb) => {
        debug('Retrying connection to own server')
        resolve(ssb)
      }).catch((e) => {
        debug(e)
        connectOrRetry()
      })
    }

    connectOrRetry()
  })
})

module.exports = db
