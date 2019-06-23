const Koa = require('koa')
const path = require('path')
const pull = require('pull-stream')
const router = require('koa-router')()
const views = require('koa-views')
const cooler = require('./lib/cooler')
const md = require('ssb-markdown')
const lodash = require('lodash')
const prettyMs = require('pretty-ms')

const app = module.exports = new Koa()

app.use(views(path.join(__dirname, 'views'), {
  map: { html: 'swig' }
}))

router
  .get('/', home)

app.use(router.routes())

async function home (ctx) {
  var ssb = await cooler.connect()
  var whoami = await cooler.get(ssb.whoami)

  const userName = await cooler.get(
    ssb.about.socialValue, {
      key: 'name',
      dest: whoami.id
    }
  )

  var msgSource = await cooler.read(
    ssb.messagesByType, {
      type: 'post',
      reverse: true,
      limit: 32
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

  const msgs = await Promise.all(rawMsgs.map(async (msg) => {
    lodash.set(msg, 'value.meta.md.block', () =>
      md.block(msg.value.content.text)
    )

    const name = await cooler.get(
      ssb.about.socialValue, { key: 'name',
        dest: msg.value.author
      }
    )

    const avatarMsg = await cooler.get(
      ssb.about.socialValue, { key: 'image',
        dest: msg.value.author
      }
    )

    const avatarId = avatarMsg != null && typeof avatarMsg.link === 'string'
      ? avatarMsg.link
      : avatarMsg

    const avatarUrl = `http://localhost:8989/blobs/get/${avatarId}`

    const ts = new Date(msg.value.timestamp)
    lodash.set(msg, 'value.meta.timestamp.received.iso8601', ts.toISOString())
    lodash.set(msg, 'value.meta.timestamp.received.since', prettyMs(Date.now() - ts, { compact: true }))
    lodash.set(msg, 'value.meta.author.name', name)
    lodash.set(msg, 'value.meta.author.avatar', {
      id: avatarId,
      url: avatarUrl
    })

    return msg
  }))

  await ctx.render('home', { whoami, msgs, userName })
}

if (!module.parent) app.listen(3000)
