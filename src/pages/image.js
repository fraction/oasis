'use strict'

const pull = require('pull-stream')
const sharp = require('sharp')
const debug = require('debug')('oasis')
const blob = require('./models/blob')

module.exports = async function imagePage ({ blobId, imageSize }) {
  const bufferSource = await blob.get({ blobId })

  debug('got buffer source')
  return new Promise((resolve) => {
    pull(
      bufferSource,
      pull.collect(async (err, bufferArray) => {
        if (err) {
          await blob.want({ blobId })
          sharp({
            create: {
              width: imageSize,
              height: imageSize,
              channels: 4,
              background: {
                r: 0, g: 0, b: 0, alpha: 0.5
              }
            }
          })
            .png()
            .toBuffer()
            .then((data) => {
              resolve(data)
            })
        } else {
          const buffer = Buffer.concat(bufferArray)
          sharp(buffer)
            .resize(imageSize, imageSize)
            .png()
            .toBuffer()
            .then((data) => {
              resolve(data)
            })
        }
      })
    )
  })
}
