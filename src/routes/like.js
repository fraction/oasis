const vote = require('./models/vote')

module.exports = async function like (ctx) {
  const msgId = ctx.params.id
  const value = Number(ctx.request.body.voteValue)
  const referer = new URL(ctx.request.header.referer)

  await vote.publish(msgId, value)

  referer.hash = `centered-footer-${encodeURIComponent(ctx.params.id)}`
  ctx.redirect(referer)
}
