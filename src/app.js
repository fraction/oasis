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
    .get('/', home)
    .get('/author/:id', author)
    .get('/hashtag/:id', hashtag)
    .get('/highlight/:id', highlight)
    .get('/profile/', profile)
    .get('/raw/:id', raw)
    .get('/status/', status)
    .get('/thread/:id', thread)
    .post('/like/:id', koaBody(), like)

  app.use(router.routes())

  const uri = `http://${config.host}:${config.port}/`
  app.listen(config.port)

  debug.enabled = true
  debug(`Listening on http://${uri}`)

  if (config.open === true) {
    open(uri)
  }
}
