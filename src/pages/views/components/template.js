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

const toAttributes = (obj) =>
  Object.entries(obj).map(([key, val]) => `${key}=${val}`).join(', ')

module.exports = (...elements) => {
  const nodes =
    html({ lang: 'en' },
      head(
        title('🏝️  Oasis'),
        link({ rel: 'stylesheet', href: '/theme.css' }),
        link({ rel: 'stylesheet', href: '/assets/style.css' }),
        link({ rel: 'stylesheet', href: '/assets/highlight.css' }),
        meta({ charset: 'utf-8' }),
        meta({
          name: 'description',
          content: 'friendly neighborhood scuttlebutt interface'
        }),
        meta({
          name: 'viewport',
          content: toAttributes({ width: 'device-width', 'initial-scale': 1 })
        })
      ),
      body(
        nav(
          ul(
            li(a({ href: '/' }, 'popular')),
            li(a({ href: '/public/latest' }, 'latest')),
            li(a({ href: '/inbox' }, 'inbox')),
            li(a({ href: '/mentions' }, 'mentions')),
            li(a({ href: '/profile' }, 'profile')),
            li(a({ href: '/search' }, 'search')),
            li(a({ href: '/meta' }, 'meta'))
          )
        ),
        main({ id: 'content' }, elements)
      ))

  const result = doctypeString + nodes.outerHTML

  return result
}
