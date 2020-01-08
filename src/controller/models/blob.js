'use strict'

const debug = require('debug')('oasis')
const cooler = require('./lib/cooler')

module.exports = {
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
