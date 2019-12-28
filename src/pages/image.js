'use strict'

let sharp

const pull = require('pull-stream')
const debug = require('debug')('oasis')
const blob = require('./models/blob')

try {
  sharp = require('sharp')
} catch (e) {
  // Optional dependency
}

const fakePixel =
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64'
  )

const fakeImage = (imageSize) =>
  sharp
    ? sharp({
      create: {
        width: imageSize,
        height: imageSize,
        channels: 4,
        background: {
          r: 0, g: 0, b: 0, alpha: 0.5
        }
      }
    })
    : new Promise((resolve) => resolve(fakePixel))

const fakeId = '&0000000000000000000000000000000000000000000=.sha256'

module.exports = async function imagePage ({ blobId, imageSize }) {
  const bufferSource = await blob.get({ blobId })

  debug('got buffer source')
  return new Promise((resolve) => {
    if (blobId === fakeId) {
      debug('fake image')
      fakeImage(imageSize).then(result => resolve(result))
    } else {
      debug('not fake image')
      pull(
        bufferSource,
        pull.collect(async (err, bufferArray) => {
          if (err) {
            await blob.want({ blobId })
            const result = fakeImage(imageSize)
            debug({ result })
            resolve(result)
          } else {
            const buffer = Buffer.concat(bufferArray)

            if (sharp) {
              sharp(buffer)
                .resize(imageSize, imageSize)
                .png()
                .toBuffer()
                .then((data) => {
                  resolve(data)
                })
            } else {
              resolve(buffer)
            }
          }
        })
      )
    }
  })
}
