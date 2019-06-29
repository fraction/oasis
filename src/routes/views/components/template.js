const {
  a,
  body,
  head,
  html,
  link,
  nav,
  section,
  title
} = require('hyperaxe')

var doctypeString = '<!DOCTYPE html>'

module.exports = (...elements) => {
  const nodes = html(
    head(
      title(`🏝️  Oasis`),
      link({ rel: 'stylesheet', href: '/static/assets/style.css' }),
      link({ rel: 'stylesheet', href: '/static/highlight.js/github.css' })
    ),
    body(
      nav(
        a({ href: '/' }, 'home'),
        a({ href: '/profile' }, 'profile'),
        a({ href: '/status' }, 'status'),
        a({ href: 'https://github.com/fraction/oasis' }, 'source'),
        a({ href: 'https://github.com/fraction/oasis/issues/new' }, 'help')
      ),
      section({ id: 'content' }, ...elements)
    )
  )

  const result = doctypeString + nodes.outerHTML

  return result
}
