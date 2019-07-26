const template = require('./components/template')
const {
  h1,
  h2,
  h3,
  label,
  li,
  pre,
  progress,
  section,
  ul
} = require('hyperaxe')

module.exports = ({ status }) => {
  const max = status.sync.since

  const progressElements = Object.entries(status.sync.plugins).map(e => {
    const [key, val] = e
    const id = `progress-${key}`
    return [
      label({ for: id }, key),
      progress({ id, value: val, max }, val)
    ]
  })

  const localPeers = Object.keys(status.local).map(key => {
    return li(key)
  })

  const remotePeers = Object.keys(status.gossip).map(key => {
    return li(key)
  })

  return template(
    section({ class: 'message' },
      h1('Status'),
      h2('Indexes'),
      progressElements,
      h2('Peers'),
      h3('Local'),
      ul(localPeers),
      h3('Remote'),
      ul(remotePeers),
      h2('Raw'),
      pre(JSON.stringify(status, null, 2))
    )
  )
}
