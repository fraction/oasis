'use strict'

const {
  a,
  body,
  head,
  html,
  link,
  meta,
  nav,
  main,
  title
} = require('hyperaxe')

const doctypeString = '<!DOCTYPE html>'

const toAttributes = (obj) => Object.entries(obj).map(([key, val]) => `${key}=${val}`).join(', ')

module.exports = (...elements) => {
  const nodes =
    html({ lang: 'en' },
      head(
        title('🏝️  Oasis'),
        link({ rel: 'stylesheet', href: '/assets/style.css' }),
        link({ rel: 'stylesheet', href: '/highlight/github.css' }),
        meta({ name: 'description', content: 'friendly neighborhood scuttlebutt interface' }),
        meta({ name: 'viewport', content: toAttributes({ width: 'device-width', 'initial-scale': 1 }) })
      ),
      body(
        nav(
          a({ href: '/' }, 'home'),
          a({ href: '/mentions' }, 'mentions'),
          a({ href: '/profile' }, 'profile'),
          a({ href: '/status' }, 'status'),
          a({ href: 'https://github.com/fraction/oasis' }, 'source'),
          a({ href: 'https://github.com/fraction/oasis/issues/new/choose' }, 'help')
        ),
        main({ id: 'content' }, ...elements)
      ))

  const result = doctypeString + nodes.outerHTML

  return result
}
