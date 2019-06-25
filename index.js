#!/usr/bin/env node

const Koa = require('koa')
const path = require('path')
const router = require('koa-router')()
const views = require('koa-views')

const author = require('./routes/author')
const hashtag = require('./routes/hashtag')
const home = require('./routes/home')
const profile = require('./routes/profile')
const thread = require('./routes/thread')

const app = module.exports = new Koa()

app.use(views(path.join(__dirname, 'views'), {
  map: { html: 'ejs' }
}))

app.use(require('koa-static')('public'))

router
  .get('/', home)
  .get('/author/:id', author)
  .get('/hashtag/:id', hashtag)
  .get('/profile/', profile)
  .get('/thread/:id', thread)

app.use(router.routes())

if (!module.parent) {
  const opts = {
    host: 'localhost',
    port: 3000
  }
  app.listen(opts)
  console.log(`open your browser to http://${opts.host}:${opts.port}/`)
}
