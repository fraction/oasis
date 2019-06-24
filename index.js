#!/usr/bin/env node

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
  map: { html: 'ejs' }
}))

router
  .get('/', home)
  .get('/message/:id', message)
  .get('/author/:id', author)

app.use(router.routes())

async function message (ctx) {
  var ssb = await cooler.connect()
  var msg = await cooler.get(ssb.get, {
    id: ctx.params.id,
    meta: true,
    private: true
  })

  async function fixUp (msg) {
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
  }

  var fixedMsg = await fixUp(msg)
  await ctx.render('single-message', { msg: fixedMsg })
}

async function author (ctx) {
  var ssb = await cooler.connect()
  var whoami = await cooler.get(ssb.whoami)

  const userName = await cooler.get(
    ssb.about.socialValue, {
      key: 'name',
      dest: whoami.id
    }
  )

  var msgSource = await cooler.read(
    ssb.createUserStream, {
      id: ctx.params.id,
      private: true,
      reverse: true
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

if (!module.parent) {
  const opts = {
    host: 'localhost',
    port: 3000
  }
  app.listen(opts)
  console.log(`open your browser to http://${opts.host}:${opts.port}/`)
}
