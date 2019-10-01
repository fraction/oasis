'use strict'

const pull = require('pull-stream')
const debug = require('debug')('oasis')
const blob = require('./models/blob')

module.exports = async function imagePage ({ blobId }) {
  const bufferSource = await blob.get({ blobId })

  debug('got buffer source')
  return new Promise((resolve) => {
    pull(
      bufferSource,
      pull.collect(async (err, bufferArray) => {
        if (err) {
          await blob.want({ blobId })
          resolve(Buffer.alloc(0))
        } else {
          const buffer = Buffer.concat(bufferArray)
          resolve(buffer)
        }
      })
    )
  })
}
