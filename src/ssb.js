'use strict'

// This module exports a function that connects to SSB and returns a "cooler"
// interface. This interface is poorly defined and should be replaced with
// native support for Promises in the MuxRPC module and auto-generated manifest
// files in the SSB-Client module.

const debug = require('debug')('oasis')
const ssbClient = require('ssb-client')
const ssbConfig = require('ssb-config')
const flotilla = require('@fraction/flotilla')

const server = flotilla(ssbConfig)

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

debug.enabled = true

let handle

const createConnection = () => {
  handle = new Promise((resolve) => {
    rawConnect().then((ssb) => {
      debug('Using pre-existing Scuttlebutt server instead of starting one')
      resolve(ssb)
    }).catch(() => {
      debug('Initial connection attempt failed')
      debug('Starting Scuttlebutt server')
      server({ ws: { http: false } })
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

  return handle
}

module.exports = () => {
  createConnection()
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
