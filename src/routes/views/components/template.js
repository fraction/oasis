const {
  a,
  body,
  head,
  html,
  link,
  nav,
  main,
  title
} = require('hyperaxe')

var doctypeString = '<!DOCTYPE html>'

module.exports = (...elements) => {
  const nodes =
    html({ lang: 'en' },
      head(
        title(`🏝️  Oasis`),
        link({ rel: 'stylesheet', href: '/assets/style.css' }),
        link({ rel: 'stylesheet', href: '/highlight/github.css' })
      ),
      body(
        nav(
          a({ href: '/' }, 'home'),
          a({ href: '/profile' }, 'profile'),
          a({ href: '/status' }, 'status'),
          a({ href: 'https://github.com/fraction/oasis' }, 'source'),
          a({ href: 'https://github.com/fraction/oasis/issues/new' }, 'help')
        ),
        main({ id: 'content' }, ...elements)
      )
    )

  const result = doctypeString + nodes.outerHTML

  return result
}
