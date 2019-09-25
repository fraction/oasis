'use strict'

const {
  a,
  body,
  head,
  html,
  li,
  link,
  main,
  meta,
  nav,
  title,
  ul
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
          ul(
            li(a({ href: '/' }, 'public')),
            li(a({ href: '/mentions' }, 'mentions')),
            li(a({ href: '/profile' }, 'profile')),
            li(a({ href: '/status' }, 'status')),
            li(a({ href: '/readme' }, 'readme'))
          )
        ),
        main({ id: 'content' }, ...elements)
      ))

  const result = doctypeString + nodes.outerHTML

  return result
}
