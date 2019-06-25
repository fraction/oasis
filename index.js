#!/usr/bin/env node

const Koa = require('koa')
const path = require('path')
const pull = require('pull-stream')
const router = require('koa-router')()
const views = require('koa-views')
const ssbRef = require('ssb-ref')

const cooler = require('./lib/cooler')
const renderMsg = require('./lib/render-msg')
const renderMd = require('./lib/render-markdown')

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
  const ssb = await cooler.connect()
  const rawMsg = await cooler.get(ssb.get, {
    id: ctx.params.id,
    meta: true,
    private: true
  })

  const msg = await renderMsg(ssb)(rawMsg)
  await ctx.render('single-message', { msg })
}

async function author (ctx) {
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

  const msgs = await Promise.all(rawMsgs.map(renderMsg(ssb)))

  await ctx.render('author', { msgs, name, description })
}

async function home (ctx) {
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

if (!module.parent) {
  const opts = {
    host: 'localhost',
    port: 3000
  }
  app.listen(opts)
  console.log(`open your browser to http://${opts.host}:${opts.port}/`)
}
