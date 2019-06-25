const cooler = require('../lib/cooler')

module.exports = async function thread (ctx) {
  const ssb = await cooler.connect()
  const rawMsg = await cooler.get(ssb.get, {
    id: ctx.params.id,
    meta: true,
    private: true
  })

  ctx.body = rawMsg
}
