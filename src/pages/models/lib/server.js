const ssbConfig = require('ssb-config')
const flotilla = require('@fraction/flotilla')
const debug = require('debug')('oasis')

// Awful hack to get make offline CLI flag available here.
// It's set in index.js
const offline = process.env.OASIS_OFFLINE === 'true'
if (offline) {
  debug.enabled = true
  debug('Offline mode activated - not connecting to scuttlebutt peers or pubs')
}

const server = flotilla({
  conn: {
    autostart: !offline
  },
  ws: {
    http: false
  }
})

server(ssbConfig)
