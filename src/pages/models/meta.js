'use strict'

const cooler = require('./lib/cooler')

module.exports = {
  whoami: async () => {
    const ssb = await cooler.connect()
    return cooler.get(ssb.whoami)
  },
  get: async (msgId) => {
    const ssb = await cooler.connect()
    return cooler.get(ssb.get, {
      id: msgId,
      meta: true,
      private: true
    })
  },
  status: async () => {
    const ssb = await cooler.connect()
    return cooler.get(ssb.status)
  }
}
