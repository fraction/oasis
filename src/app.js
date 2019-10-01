'use strict'

const Koa = require('koa')
const path = require('path')
const router = require('koa-router')()
const koaStatic = require('koa-static')
const mount = require('koa-mount')
const open = require('open')
const koaBody = require('koa-body')
const debug = require('debug')('oasis')
const ssbRef = require('ssb-ref')
const requireStyle = require('require-style')

const author = require('./pages/author')
const hashtag = require('./pages/hashtag')
const publicPage = require('./pages/public')
const profile = require('./pages/profile')
const json = require('./pages/json')
const thread = require('./pages/thread')
const like = require('./pages/like')
const likesPage = require('./pages/likes')
const status = require('./pages/status')
const mentions = require('./pages/mentions')
const reply = require('./pages/reply')
const replyAll = require('./pages/reply-all')
const publishReply = require('./pages/publish-reply')
const publishReplyAll = require('./pages/publish-reply-all')
const image = require('./pages/image')
const blob = require('./pages/blob')
const publish = require('./pages/publish')
const markdown = require('./pages/markdown')

const defaultTheme = 'unikitty-light'

module.exports = (config) => {
  const assets = new Koa()
  assets.use(koaStatic(path.join(__dirname, 'assets')))

  const app = new Koa()
  module.exports = app

  app.on('error', (e) => {
    // Output full error objects
    e.message = e.stack
    e.expose = true
    return null
  })

  app.use(mount('/assets', assets))

  router
    .param('imageSize', (imageSize, ctx, next) => {
      const size = Number(imageSize)
      const isInteger = size % 1 === 0
      const overMinSize = size > 2
      const underMaxSize = size < 256
      ctx.assert(isInteger && overMinSize && underMaxSize, 'Invalid image size')
      return next()
    })
    .param('blobId', (blobId, ctx, next) => {
      ctx.assert(ssbRef.isBlob(blobId), 400, 'Invalid blob link')
      return next()
    })
    .param('message', (message, ctx, next) => {
      ctx.assert(ssbRef.isMsg(message), 400, 'Invalid message link')
      return next()
    })
    .param('feed', (message, ctx, next) => {
      ctx.assert(ssbRef.isFeedId(message), 400, 'Invalid feed link')
      return next()
    })
    .get('/', async (ctx) => {
      ctx.body = await publicPage()
    })
    .get('/author/:feed', async (ctx) => {
      const { feed } = ctx.params
      ctx.body = await author(feed)
    })
    .get('/hashtag/:channel', async (ctx) => {
      const { channel } = ctx.params
      ctx.body = await hashtag(channel)
    })
    .get('/theme.css', (ctx) => {
      const theme = ctx.cookies.get('theme') || defaultTheme

      const filePath = `base16-styles/css-variables/base16-${theme}.css`
      ctx.type = 'text/css'
      ctx.body = requireStyle(filePath)
    })
    .get('/profile/', async (ctx) => {
      ctx.body = await profile()
    })
    .get('/json/:message', async (ctx) => {
      const { message } = ctx.params
      ctx.type = 'application/json'
      ctx.body = await json(message)
    })
    .get('/blob/:blobId', async (ctx) => {
      const { blobId } = ctx.params
      ctx.body = await blob({ blobId })
      if (ctx.body.length === 0) {
        ctx.response.status = 404
      } else {
        ctx.set('Cache-Control', 'public,max-age=31536000,immutable')
      }

      // This prevents an auto-download when visiting the URL.
      ctx.attachment(blobId, { type: 'inline' })
    })
    .get('/image/:imageSize/:blobId', async (ctx) => {
      const { blobId, imageSize } = ctx.params
      ctx.type = 'image/png'
      ctx.body = await image({ blobId, imageSize: Number(imageSize) })
    })
    .get('/status/', async (ctx) => {
      const theme = ctx.cookies.get('theme') || defaultTheme
      ctx.body = await status({ theme })
    })
    .get('/likes/', async (ctx) => {
      ctx.body = await likesPage()
    })
    .get('/readme/', async (ctx) => {
      ctx.body = await markdown(config.readme)
    })
    .get('/mentions/', async (ctx) => {
      ctx.body = await mentions()
    })
    .get('/thread/:message', async (ctx) => {
      const { message } = ctx.params
      ctx.body = await thread(message)
    })
    .get('/reply/:message', async (ctx) => {
      const { message } = ctx.params
      ctx.body = await reply(message, false)
    })
    .get('/reply-all/:message', async (ctx) => {
      const { message } = ctx.params
      ctx.body = await replyAll(message, false)
    })
    .post('/reply/:message', koaBody(), async (ctx) => {
      const { message } = ctx.params
      const text = String(ctx.request.body.text)
      ctx.body = await publishReply({ message, text })
      ctx.redirect('/')
    })
    .post('/reply-all/:message', koaBody(), async (ctx) => {
      const { message } = ctx.params
      const text = String(ctx.request.body.text)
      ctx.body = await publishReplyAll({ message, text })
      ctx.redirect('/')
    })
    .post('/publish/', koaBody(), async (ctx) => {
      const text = String(ctx.request.body.text)
      ctx.body = await publish({ text })
      ctx.redirect('/')
    })
    .post('/like/:message', koaBody(), async (ctx) => {
      const { message } = ctx.params
      // TODO: convert all so `message` is full message and `messageKey` is key
      const messageKey = message

      const voteValue = Number(ctx.request.body.voteValue)

      const encoded = {
        message: encodeURIComponent(message)
      }

      const referer = new URL(ctx.request.header.referer)
      referer.hash = `centered-footer-${encoded.message}`

      ctx.body = await like({ messageKey, voteValue })
      ctx.redirect(referer)
    })
    .post('/theme.css', koaBody(), async (ctx) => {
      const theme = String(ctx.request.body.theme)
      ctx.cookies.set('theme', theme)
      const referer = new URL(ctx.request.header.referer)
      ctx.redirect(referer)
    })

  app.use(router.routes())

  const { host } = config
  const { port } = config
  const uri = `http://${host}:${port}/`

  debug.enabled = true
  debug(`Listening on ${uri}`)

  app.listen({ host, port })

  if (config.open === true) {
    open(uri)
  }
}
