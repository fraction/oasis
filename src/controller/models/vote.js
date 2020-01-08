'use strict'

const cooler = require('./lib/cooler')

module.exports = {
  publish: async ({ messageKey, value, recps }) => {
    const ssb = await cooler.connect()
    const branch = await cooler.get(ssb.tangle.branch, messageKey)

    await cooler.get(ssb.publish, {
      type: 'vote',
      vote: {
        link: messageKey,
        value: Number(value)
      },
      branch,
      recps
    })
  }
}
