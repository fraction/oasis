const pull = require('pull-stream')

const cooler = require('../lib/cooler')
const renderMsg = require('../lib/render-message')

module.exports = async function home (ctx) {
  var ssb = await cooler.connect()

  var msgSource = await cooler.read(
    ssb.messagesByType, {
      limit: 32,
      private: true,
      reverse: true,
      type: 'post'
    }
  )

  const rawMsgs = await new Promise((resolve, reject) => {
    pull(
      msgSource,
      pull.collect((err, msgs) => {
        if (err) return reject(err)
        resolve(msgs)
      })
    )
  })

  const msgs = await Promise.all(rawMsgs.map(renderMsg(ssb)))

  await ctx.render('home', { msgs })
}
