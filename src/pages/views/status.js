'use strict'

const highlightJs = require('highlight.js')
const {
  button,
  div,
  form,
  h1,
  h2,
  h3,
  label,
  li,
  option,
  p,
  pre,
  progress,
  section,
  select,
  ul
} = require('hyperaxe')
const template = require('./components/template')

module.exports = ({ status, theme }) => {
  const max = status.sync.since

  const progressElements = Object.entries(status.sync.plugins).map((e) => {
    const [key, val] = e
    const id = `progress-${key}`
    return [
      label({ for: id }, key),
      progress({ id, value: val, max }, val)
    ]
  })

  const localPeers = Object.keys(status.local || []).map((key) => li(key))

  const remotePeers = Object.keys(status.gossip || []).map((key) => li(key))

  const raw = JSON.stringify(status, null, 2)
  const rawHighlighted = highlightJs.highlight('json', raw).value

  // copy and pasted from `ls` in module
  const themes = [
    '3024',
    'apathy',
    'ashes',
    'atelier-cave',
    'atelier-dune',
    'atelier-estuary',
    'atelier-forest',
    'atelier-heath',
    'atelier-lakeside',
    'atelier-plateau',
    'atelier-savanna',
    'atelier-seaside',
    'atelier-sulphurpool',
    'bespin',
    'brewer',
    'bright',
    'chalk',
    'codeschool',
    'cupcake',
    'darktooth',
    'default-dark',
    'default-light',
    'dracula',
    'eighties',
    'embers',
    'flat',
    'github',
    'google-dark',
    'google-light',
    'grayscale-dark',
    'grayscale-light',
    'green-screen',
    'gruvbox-dark-hard',
    'gruvbox-dark-medium',
    'gruvbox-dark-pale',
    'gruvbox-dark-soft',
    'gruvbox-light-hard',
    'gruvbox-light-medium',
    'gruvbox-light-soft',
    'harmonic16-dark',
    'harmonic16-light',
    'hopscotch',
    'ir-black',
    'isotope',
    'london-tube',
    'macintosh',
    'marrakesh',
    'materia',
    'mexico-light',
    'mocha',
    'monokai',
    'nord',
    'ocean',
    'oceanicnext',
    'onedark',
    'paraiso',
    'phd',
    'pico',
    'pop',
    'railscasts',
    'rebecca',
    'seti-ui',
    'shapeshifter',
    'solar-flare',
    'solarized-dark',
    'solarized-light',
    'spacemacs',
    'summerfruit-dark',
    'summerfruit-light',
    'tomorrow-night',
    'tomorrow',
    'twilight',
    'unikitty-dark',
    'unikitty-light',
    'woodland'
  ]

  const themeElements = themes.map((cur) => {
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
      h1('Theme'),
      p('Choose from any theme you\'d like. The default theme is Tomorrow. Other favorites are Ashes, Chalk, Default, Eighties, Google, Harmonic16, IR Black, Monokai, Rebecca, Solarized, Summerfruit, and Unikitty.'),
      form({ action: '/theme.css', method: 'post' },
        select({ name: 'theme' }, ...themeElements),
        button({ type: 'submit' }, 'set theme')),
      base16Elements,
      h1('Status'),
      h2('Indexes'),
      progressElements,
      h2('Peers'),
      h3('Local'),
      ul(localPeers),
      h3('Remote'),
      ul(remotePeers),
      h2('Raw'),
      pre({ innerHTML: rawHighlighted }))
  )
}
