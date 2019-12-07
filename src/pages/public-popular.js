'use strict'

const publicView = require('./views/public')
const { nav, ul, li, a } = require('hyperaxe')
const post = require('./models/post')

module.exports = async function publicPopularPage ({ period }) {
  const messages = await post.popular({ period })

  const option = (somePeriod) =>
    li(
      period === somePeriod
        ? a({ class: 'current', href: `./${somePeriod}` }, somePeriod)
        : a({ href: `./${somePeriod}` }, somePeriod)
    )

  const prefix = nav(
    ul(
      option('day'),
      option('week'),
      option('month'),
      option('year')
    )
  )

  return publicView({
    messages,
    prefix
  })
}
