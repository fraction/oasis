const pull = require('pull-stream')

const cooler = require('../lib/cooler')
const renderMsg = require('../lib/render-message')

module.exports = async function hashtag (ctx) {
  var ssb = await cooler.connect()

  var filterQuery = {
    $filter: {
      dest: '#' + ctx.params.id
    }
  }

  const msgSource = await cooler.read(
    ssb.backlinks.read,
    {
      query: [ filterQuery ],
      index: 'DTA', // use asserted timestamps
      reverse: true,
      private: true,
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

  await ctx.render('home', { msgs })
}
