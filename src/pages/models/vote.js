'use strict'

const cooler = require('./lib/cooler')

module.exports = {
  publish: async ({ messageKey, value, recps }) => {
    const ssb = await cooler.connect()
    await cooler.get(ssb.publish, {
      type: 'vote',
      vote: {
        link: messageKey,
        value: Number(value)
      },
      recps
    })
  }
}
