'use strict'

// Koa application to provide HTTP interface.

const cli = require('./cli')
const config = cli()

if (config.debug) {
  process.env.DEBUG = 'oasis,oasis:*'
}

// HACK: We must get the CLI config and then delete environment variables.
// This hides arguments from other upstream modules who might parse them.
//
// Unfortunately some modules think that our CLI options are meant for them,
// and since there's no way to disable that behavior (!) we have to hide them
// manually by setting the args property to an empty array.
process.argv = []

const http = require('./http')

const debug = require('debug')('oasis')
const fs = require('fs').promises
const koaBody = require('koa-body')
const open = require('open')
const path = require('path')
const requireStyle = require('require-style')
const router = require('koa-router')()
const ssbRef = require('ssb-ref')

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
const comment = require('./pages/comment')
const publishReply = require('./pages/publish-reply')
const publishComment = require('./pages/publish-comment')
const image = require('./pages/image')
const blob = require('./pages/blob')
const publish = require('./pages/publish')
const markdown = require('./pages/markdown')
const inboxPage = require('./pages/inbox')
const searchPage = require('./pages/search')

const defaultTheme = 'atelier-sulphurPool-light'.toLowerCase()

// TODO: refactor
const start = async () => {
  const filePath = path.join(__dirname, '..', 'README.md')
  config.readme = await fs.readFile(filePath, 'utf8')
}
start()

router
  .param('imageSize', (imageSize, ctx, next) => {
    const size = Number(imageSize)
    const isInteger = size % 1 === 0
    const overMinSize = size > 2
    const underMaxSize = size <= 256
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
  .get('/comment/:message', async (ctx) => {
    const { message } = ctx.params
    ctx.body = await comment(message)
  })
  .post('/reply/:message', koaBody(), async (ctx) => {
    const { message } = ctx.params
    const text = String(ctx.request.body.text)
    ctx.body = await publishReply({ message, text })
    ctx.redirect(`/thread/${encodeURIComponent(message)}`)
  })
  .post('/comment/:message', koaBody(), async (ctx) => {
    const { message } = ctx.params
    const text = String(ctx.request.body.text)
    ctx.body = await publishComment({ message, text })
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

const { host } = config
const { port } = config

http({
  host,
  port,
  routes: router.routes()
})

const uri = `http://${host}:${port}/`

debug.enabled = true
debug(`Listening on ${uri}`)

if (config.open === true) {
  open(uri)
}
