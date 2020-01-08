
const Koa = require('koa')
const koaStatic = require('koa-static')
const path = require('path')
const mount = require('koa-mount')

module.exports = ({ host, port, routes }) => {
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
  app.use(routes)
  app.listen({ host, port })
}
