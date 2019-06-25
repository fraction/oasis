const cooler = require('../lib/cooler')
const renderMsg = require('../lib/render-message')

module.exports = async function thread (ctx) {
  const ssb = await cooler.connect()
  const rawMsg = await cooler.get(ssb.get, {
    id: ctx.params.id,
    meta: true,
    private: true
  })

  const msg = await renderMsg(ssb)(rawMsg)
  await ctx.render('thread', { msg })
}
