'use strict'

const pull = require('pull-stream')
const sharp = require('sharp')
const blob = require('./models/blob')
const debug = require('debug')('oasis')

module.exports = async function ({ blobId, imageSize }) {
  const bufferSource = await blob.get({ blobId })

  debug('got buffer source')
  return new Promise((resolve) => {
    pull(
      bufferSource,
      pull.collect((err, bufferArray) => {
        if (err) return resolve(null)

        const buffer = Buffer.concat(bufferArray)
        sharp(buffer)
          .resize(imageSize, imageSize)
          .png()
          .toBuffer()
          .then(data => {
            resolve(data)
          })
      })
    )
  })
}
