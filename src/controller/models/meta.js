'use strict'

const cooler = require('./lib/cooler')
const pull = require('pull-stream')

module.exports = {
  myFeedId: async () => {
    const ssb = await cooler.connect()
    const { id } = ssb
    return id
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
  },
  peers: async () => {
    const ssb = await cooler.connect()
    const peersSource = await cooler.read(ssb.conn.peers)

    return new Promise((resolve, reject) => {
      pull(
        peersSource,
        // https://github.com/staltz/ssb-conn/issues/9
        pull.take(1),
        pull.collect((err, val) => {
          if (err) return reject(err)
          resolve(val[0])
        })
      )
    })
  }
}
