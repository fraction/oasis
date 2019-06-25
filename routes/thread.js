const lodash = require('lodash')
const pull = require('pull-stream')

const cooler = require('../lib/cooler')
const renderMsg = require('../lib/render-message')

module.exports = async function thread (ctx) {
  const ssb = await cooler.connect()
  const rawMsg = await cooler.get(ssb.get, {
    id: ctx.params.id,
    meta: true,
    private: true
  })

  const root = rawMsg.key // lodash.get(rawMsg, 'value.content.root', rawMsg.key)

  var filterQuery = {
    $filter: {
      dest: root
    }
  }

  const backlinkStream = await cooler.read(ssb.backlinks.read, {
    query: [filterQuery],
    index: 'DTA' // use asserted timestamps
  })

  const rawMsgs = await new Promise((resolve, reject) =>
    pull(
      backlinkStream,
      pull.filter(msg =>
        lodash.get(msg, 'value.content.type') === 'post'
      ),
      pull.collect((err, msgs) => {
        if (err) return reject(err)
        resolve(msgs)
      })
    )
  )

  const allMsgs = [rawMsg, ...rawMsgs]
  const msgs = await Promise.all(allMsgs.map(renderMsg(ssb)))

  await ctx.render('home', { msgs })
}
