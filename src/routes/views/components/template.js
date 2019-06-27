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

const desertIslandEmoji = '\ud83c' + '\udfdd' + '\ufe0f'

module.exports = (...elements) => {
  const nodes = html(
    head(
      title(`${desertIslandEmoji} Oasis`),
      link({ rel: 'stylesheet', href: '/static/assets/style.css' }),
      link({ rel: 'stylesheet', href: '/static/hljs/github.css' })
    ),
    body(
      nav(
        a({ href: '/' }, 'home'),
        a({ href: '/profile' }, 'profile'),
        a({ href: 'https://github.com/fraction/oasis' }, 'source'),
        a({ href: 'https://github.com/fraction/oasis/issues/new' }, 'help')
      ),
      section({ id: 'content' }, ...elements)
    )
  )

  const result = doctypeString + nodes.outerHTML

  return result
}
