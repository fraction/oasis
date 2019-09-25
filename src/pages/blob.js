'use strict'

const pull = require('pull-stream')
const sharp = require('sharp')
const debug = require('debug')('oasis')
const blob = require('./models/blob')

const fakeImage = (imageSize) =>
  sharp({
    create: {
      width: imageSize,
      height: imageSize,
      channels: 4,
      background: {
        r: 0, g: 0, b: 0, alpha: 0.5
      }
    }
  }).png().toBuffer()

const fakeId = '&0000000000000000000000000000000000000000000=.sha256'

module.exports = async function imagePage ({ blobId }) {
  const bufferSource = await blob.get({ blobId })

  debug('got buffer source')
  return new Promise((resolve) => {
    if (blobId === fakeId) {
      fakeImage(1).then(result => resolve(result))
    } else {
      pull(
        bufferSource,
        pull.collect(async (err, bufferArray) => {
          if (err) {
            await blob.want({ blobId })
            fakeImage(1).then(result => resolve(result))
          } else {
            const buffer = Buffer.concat(bufferArray)
            resolve(buffer)
          }
        })
      )
    }
  })
}
