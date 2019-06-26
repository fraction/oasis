const cooler = require('../lib/cooler')

module.exports = async function like (ctx) {
  const ssb = await cooler.connect()

  await cooler.get(ssb.publish, {
    type: 'vote',
    vote: {
      link: ctx.params.id,
      value: Number(ctx.request.body.voteValue)
    }
  })

  const back = new URL(ctx.request.header.referer)
  back.hash = encodeURIComponent(ctx.params.id)
  ctx.redirect(back)
}
