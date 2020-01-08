'use strict'

const {
  a,
  button,
  code,
  div,
  form,
  h1,
  h2,
  h3,
  label,
  li,
  option,
  p,
  progress,
  section,
  select,
  ul
} = require('hyperaxe')
const template = require('./components/template')

module.exports = ({ status, peers, theme, themeNames }) => {
  const max = status.sync.since

  const progressElements = Object.entries(status.sync.plugins).map((e) => {
    const [key, val] = e
    const id = `progress-${key}`
    return div(
      label({ for: id }, key),
      progress({ id, value: val, max }, val)
    )
  })

  const peerList = (peers || [])
    .map(([key, data]) =>
      li(
        a(
          { href: `/author/${encodeURIComponent(data.key)}` },
          code(data.key)
        )
      )
    )

  const themeElements = themeNames.map((cur) => {
    const isCurrentTheme = cur === theme
    if (isCurrentTheme) {
      return option({ value: cur, selected: true }, cur)
    } else {
      return option({ value: cur }, cur)
    }
  })

  const base16 = [
    // '00', removed because this is the background
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '0A',
    '0B',
    '0C',
    '0D',
    '0E',
    '0F'
  ]

  const base16Elements = base16.map((base) =>
    div({
      style: {
        'background-color': `var(--base${base})`,
        width: `${1 / base16.length * 100}%`,
        height: '1em',
        'margin-top': '1em',
        display: 'inline-block'
      }
    })
  )

  return template(
    section({ class: 'message' },
      h1('Meta'),
      p(
        'Check out ',
        a({ href: '/meta/readme' }, 'the readme'),
        ', configure your theme, or view debugging information below.'
      ),
      h2('Theme'),
      p('Choose from any theme you\'d like. The default theme is Atelier-SulphurPool-Light.'),
      form({ action: '/theme.css', method: 'post' },
        select({ name: 'theme' }, ...themeElements),
        button({ type: 'submit' }, 'set theme')),
      base16Elements,
      h2('Status'),
      h3('Indexes'),
      progressElements,
      peerList.length > 0
        ? [h3('Peers'), ul(peerList)]
        : null
    )
  )
}
