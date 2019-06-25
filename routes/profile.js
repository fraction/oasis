const cooler = require('../lib/cooler')
const author = require('./author')

module.exports = async function (ctx) {
  const ssb = await cooler.connect()
  const whoami = await cooler.get(ssb.whoami)
  ctx.params.id = whoami.id
  await author(ctx)
}
