module.exports = (config) => {
  if (config.debug) {
    process.env.DEBUG = '*'
  }

  const Koa = require('koa')
  const path = require('path')
  const router = require('koa-router')()
  const koaStatic = require('koa-static')
  const mount = require('koa-mount')
  const open = require('open')
  const koaBody = require('koa-body')
  const debug = require('debug')('oasis')
  const ssbRef = require('ssb-ref')

  const author = require('./routes/author')
  const hashtag = require('./routes/hashtag')
  const home = require('./routes/home')
  const profile = require('./routes/profile')
  const raw = require('./routes/raw')
  const thread = require('./routes/thread')
  const like = require('./routes/like')
  const status = require('./routes/status')
  const highlight = require('./routes/highlight')

  const assets = new Koa()
  assets.use(koaStatic(path.join(__dirname, 'assets')))

  const app = module.exports = new Koa()

  app.use(mount('/assets', assets))

  router
    .param('message', (message, ctx, next) => {
      ctx.assert(ssbRef.isMsg(message), 400, 'Invalid message link')
      return next()
    })
    .param('feed', (message, ctx, next) => {
      ctx.assert(ssbRef.isFeedId(message), 400, 'Invalid feed link')
      return next()
    })
    .get('/', async (ctx) => {
      ctx.body = await home()
    })
    .get('/author/:feed', async (ctx) => {
      const { feed } = ctx.params
      ctx.body = await author(feed)
    })
    .get('/hashtag/:channel', async (ctx) => {
      const { channel } = ctx.params
      ctx.body = await hashtag(channel)
    })
    .get('/highlight/:style', (ctx) => {
      const { style } = ctx.params
      ctx.body = highlight(style)
    })
    .get('/profile/', async (ctx) => {
      ctx.body = await profile()
    })
    .get('/raw/:message', async (ctx) => {
      const { message } = ctx.params
      ctx.type = 'application/json'
      ctx.body = await raw(message)
    })
    .get('/status/', async (ctx) => {
      ctx.body = await status()
    })
    .get('/thread/:message', async (ctx) => {
      const { message } = ctx.params
      ctx.body = await thread(message)
    })
    .post('/like/:message', koaBody(), async (ctx) => {
      const { message } = ctx.params

      const voteValue = Number(ctx.request.body.voteValue)
      const referer = new URL(ctx.request.header.referer)

      const encoded = {
        message: encodeURIComponent(message)
      }

      referer.hash = `centered-footer-${encoded.message}`

      ctx.body = await like({ message, voteValue })
      ctx.redirect(referer)
    })

  app.use(router.routes())

  const host = config['web-host']
  const port = config['web-port']
  const uri = `http://${host}:${port}/`

  debug.enabled = true
  debug(`Listening on ${uri}`)

  app.listen({ host, port })

  if (config.open === true) {
    open(uri)
  }
}
