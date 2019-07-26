const template = require('./components/template')
const { h1, h2, label, progress, ul, li, section } = require('hyperaxe')

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

  const gossipElements = Object.keys(status.gossip).map(key => {
    return li(key)
  })

  return template(
    section({ class: 'message' },
      h1('Status'),
      h2('Indexes'),
      progressElements,
      h2('Peers'),
      ul(gossipElements)
    )
  )
}
