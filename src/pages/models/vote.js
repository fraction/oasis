'use strict'
const cooler = require('./lib/cooler')

module.exports = {
  publish: async (messageId, value) => {
    const ssb = await cooler.connect()
    await cooler.get(ssb.publish, {
      type: 'vote',
      vote: {
        link: messageId,
        value: Number(value)
      }
    })
  }
}
