const Koa = require('koa')
const path = require('path')
const router = require('koa-router')()
const koaStatic = require('koa-static')
const mount = require('koa-mount')
const open = require('open')
const koaBody = require('koa-body')

const author = require('./routes/author')
const hashtag = require('./routes/hashtag')
const home = require('./routes/home')
const profile = require('./routes/profile')
const raw = require('./routes/raw')
const thread = require('./routes/thread')
const like = require('./routes/like')
const status = require('./routes/status')

module.exports = (config) => {
  const assets = new Koa()
  assets.use(koaStatic(path.join(__dirname, 'assets')))

  const highlightJs = new Koa()
  highlightJs.use(koaStatic(path.join(__dirname, '..', 'node_modules', 'highlight.js', 'styles')))

  const app = module.exports = new Koa()

  app.use(mount('/static/assets', assets))
  app.use(mount('/static/highlight.js', highlightJs))

  router
    .get('/', home)
    .get('/author/:id', author)
    .get('/status/', status)
    .get('/hashtag/:id', hashtag)
    .get('/profile/', profile)
    .get('/raw/:id', raw)
    .get('/thread/:id', thread)
    .post('/like/:id', koaBody(), like)

  app.use(router.routes())

  const uri = `http://${config.host}:${config.port}/`
  app.listen(config.port)
  console.log(`Listening on http://${uri}`)

  if (config.open === true) {
    open(uri)
  }
}
