const ssbRef = require('ssb-ref')
const pull = require('pull-stream')

const cooler = require('../lib/cooler')
const renderMd = require('../lib/render-markdown')
const renderMsg = require('../lib/render-message')

module.exports = async function (ctx) {
  if (ssbRef.isFeed(ctx.params.id) === false) {
    throw new Error(`not a feed: ${ctx.params.id}`)
  }
  var ssb = await cooler.connect()

  var rawDescription = await cooler.get(
    ssb.about.socialValue,
    { key: 'description', dest: ctx.params.id }
  )

  const name = await cooler.get(
    ssb.about.socialValue, { key: 'name',
      dest: ctx.params.id
    }
  )

  const description = renderMd(rawDescription)

  var msgSource = await cooler.read(
    ssb.createUserStream, {
      id: ctx.params.id,
      private: true,
      reverse: true,
      meta: true
    }
  )

  const rawMsgs = await new Promise((resolve, reject) => {
    pull(
      msgSource,
      pull.filter(msg =>
        typeof msg.value.content !== 'string' &&
        msg.value.content.type === 'post'
      ),
      pull.take(32),
      pull.collect((err, msgs) => {
        if (err) return reject(err)
        resolve(msgs)
      })
    )
  })

  const msgs = await Promise.all(rawMsgs.map(renderMsg(ssb)))

  await ctx.render('author', { msgs, name, description })
}
