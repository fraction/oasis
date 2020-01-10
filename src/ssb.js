'use strict'

// This module exports a function that connects to SSB and returns a "cooler"
// interface. This interface is poorly defined and should be replaced with
// native support for Promises in the MuxRPC module and auto-generated manifest
// files in the SSB-Client module.

const ssbClient = require('ssb-client')
const ssbConfig = require('ssb-config')
const flotilla = require('@fraction/flotilla')
const debug = require('debug')('oasis')

const server = flotilla(ssbConfig)

const log = (...args) => {
  const isDebugEnabled = debug.enabled
  debug.enabled = true
  debug(...args)
  debug.enabled = isDebugEnabled
}

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

let handle

const createConnection = (config) => {
  handle = new Promise((resolve) => {
    rawConnect().then((ssb) => {
      log('Using pre-existing Scuttlebutt server instead of starting one')
      resolve(ssb)
    }).catch(() => {
      log('Initial connection attempt failed')
      log('Starting Scuttlebutt server')
      server(config)
      const connectOrRetry = () => {
        rawConnect().then((ssb) => {
          log('Retrying connection to own server')
          resolve(ssb)
        }).catch((e) => {
          log(e)
          connectOrRetry()
        })
      }

      connectOrRetry()
    })
  })

  return handle
}

module.exports = ({ offline }) => {
  if (offline) {
    log('Offline mode activated - not connecting to scuttlebutt peers or pubs')
    log('WARNING: offline mode cannot control the behavior of pre-existing servers')
  }

  const config = {
    conn: {
      autostart: !offline
    },
    ws: {
      http: false
    }
  }

  createConnection(config)
  return {
    connect () {
      // This has interesting behavior that may be unexpected.
      //
      // If `handle` is already an active [non-closed] connection, return that.
      //
      // If the connection is closed, we need to restart it. It's important to
      // note that if we're depending on an external service (like Patchwork) and
      // that app is closed, then Oasis will seamlessly start its own SSB service.
      return new Promise((resolve, reject) => {
        handle.then((ssb) => {
          if (ssb.closed) {
            createConnection()
          }
          resolve(handle)
        })
      })
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
}
