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

module.exports = (options) => {
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
    .get('/hashtag/:id', hashtag)
    .get('/profile/', profile)
    .get('/thread/:id', thread)
    .get('/raw/:id', raw)
    .post('/like/:id', koaBody(), like)

  app.use(router.routes())

  const defaultConfig = {
    host: 'localhost',
    port: 3000
  }

  const config = Object.assign({}, defaultConfig, options)

  const uri = `http://${config.host}:${config.port}/`
  app.listen(config)
  console.log(`Listening on http://${uri}`)
  open(uri)
}
