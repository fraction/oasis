'use strict'

const debug = require('debug')('oasis')
const cooler = require('./lib/cooler')

module.exports = {
  get: async ({ blobId }) => {
    debug('requested blob: %s', blobId)
    const ssb = await cooler.connect()
    return cooler.read(ssb.blobs.get, blobId)
  },
  want: async ({ blobId }) => {
    debug('requested blob: %s', blobId)
    const ssb = await cooler.connect()
    return cooler.get(ssb.blobs.want, blobId)
  }
}
