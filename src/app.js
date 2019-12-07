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
const publicPopularPage = require('./pages/public-popular')
const publicLatestPage = require('./pages/public-latest')
const profile = require('./pages/profile')
const json = require('./pages/json')
const thread = require('./pages/thread')
const like = require('./pages/like')
const likesPage = require('./pages/likes')
const meta = require('./pages/meta')
const mentions = require('./pages/mentions')
const reply = require('./pages/reply')
const replyAll = require('./pages/reply-all')
const publishReply = require('./pages/publish-reply')
const publishReplyAll = require('./pages/publish-reply-all')
const image = require('./pages/image')
const blob = require('./pages/blob')
const publish = require('./pages/publish')
const markdown = require('./pages/markdown')
const inboxPage = require('./pages/inbox')
const searchPage = require('./pages/search')

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

  // headers
  app.use(async (ctx, next) => {
    await next()

    const csp = [
      'default-src \'none\'',
      'img-src \'self\'',
      'form-action \'self\'',
      'media-src \'self\'',
      'style-src \'self\' \'unsafe-inline\''
    ].join('; ')

    // Disallow scripts.
    ctx.set('Content-Security-Policy', csp)

    // Disallow <iframe> embeds from other domains.
    ctx.set('X-Frame-Options', 'SAMEORIGIN')

    // Disallow browsers overwriting declared media types.
    ctx.set('X-Content-Type-Options', 'nosniff')

    // Disallow sharing referrer with other domains.
    ctx.set('Referrer-Policy', 'same-origin')

    // Disallow extra browser features except audio output.
    ctx.set('Feature-Policy', 'speaker \'self\'')

    if (ctx.method !== 'GET') {
      const referer = ctx.request.header.referer
      ctx.assert(referer != null, `HTTP ${ctx.method} must include referer`)
      const refererUrl = new URL(referer)
      const isBlobUrl = refererUrl.pathname.startsWith('/blob/')
      ctx.assert(isBlobUrl === false, `HTTP ${ctx.method} from blob URL not allowed`)
    }
  })

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
      ctx.redirect('/public/popular/day')
    })
    .get('/public/popular/:period', async (ctx) => {
      const { period } = ctx.params
      ctx.body = await publicPopularPage({ period })
    })
    .get('/public/latest', async (ctx) => {
      ctx.body = await publicLatestPage()
    })
    .get('/author/:feed', async (ctx) => {
      const { feed } = ctx.params
      ctx.body = await author(feed)
    })
    .get('/search/', async (ctx) => {
      const { query } = ctx.query
      ctx.body = await searchPage({ query })
    })
    .get('/inbox', async (ctx) => {
      ctx.body = await inboxPage()
    })
    .get('/hashtag/:channel', async (ctx) => {
      const { channel } = ctx.params
      ctx.body = await hashtag(channel)
    })
    .get('/theme.css', (ctx) => {
      const theme = ctx.cookies.get('theme') || defaultTheme

      const packageName = '@fraction/base16-css'
      const filePath = `${packageName}/src/base16-${theme}.css`
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
    .get('/meta/', async (ctx) => {
      const theme = ctx.cookies.get('theme') || defaultTheme
      ctx.body = await meta({ theme })
    })
    .get('/likes/:feed', async (ctx) => {
      const { feed } = ctx.params
      ctx.body = await likesPage({ feed })
    })
    .get('/meta/readme/', async (ctx) => {
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
      ctx.body = await reply(message)
    })
    .get('/reply-all/:message', async (ctx) => {
      const { message } = ctx.params
      ctx.body = await replyAll(message)
    })
    .post('/reply/:message', koaBody(), async (ctx) => {
      const { message } = ctx.params
      const text = String(ctx.request.body.text)
      ctx.body = await publishReply({ message, text })
      ctx.redirect(`/thread/${encodeURIComponent(message)}`)
    })
    .post('/reply-all/:message', koaBody(), async (ctx) => {
      const { message } = ctx.params
      const text = String(ctx.request.body.text)
      ctx.body = await publishReplyAll({ message, text })
      ctx.redirect(`/thread/${encodeURIComponent(message)}`)
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
