#!/usr/bin/env node

const Koa = require('koa')
const path = require('path')
const router = require('koa-router')()
const views = require('koa-views')
const koaStatic = require('koa-static')
const mount = require('koa-mount')
const open = require('open')

const author = require('./routes/author')
const hashtag = require('./routes/hashtag')
const home = require('./routes/home')
const profile = require('./routes/profile')
const raw = require('./routes/raw')
const thread = require('./routes/thread')
const like = require('./routes/like')

const assets = new Koa()
assets.use(koaStatic(path.join(__dirname, 'public')))

const hljs = new Koa()
hljs.use(koaStatic(path.join(__dirname, 'node_modules', 'highlight.js', 'styles')))

const app = module.exports = new Koa()

app.use(mount('/static/public', assets))
app.use(mount('/static/hljs', hljs))

app.use(views(path.join(__dirname, 'views'), {
  map: { html: 'ejs' }
}))

router
  .get('/', home)
  .get('/author/:id', author)
  .get('/hashtag/:id', hashtag)
  .get('/profile/', profile)
  .get('/thread/:id', thread)
  .get('/raw/:id', raw)
  .post('/like/:id', like)

app.use(router.routes())

const opts = {
  host: 'localhost',
  port: 3000
}

const uri = `http://${opts.host}:${opts.port}/`
app.listen(opts)
console.log(`Listening on http://${uri}`)
open(uri)
