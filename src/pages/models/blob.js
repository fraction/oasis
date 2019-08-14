'use strict'

const cooler = require('./lib/cooler')
const debug = require('debug')('oasis')

module.exports = {
  get: async ({ blobId }) => {
    debug('requested blob: %s', blobId)
    const ssb = await cooler.connect()
    return cooler.read(ssb.blobs.get, blobId)
  }
}
