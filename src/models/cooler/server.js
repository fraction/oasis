const ssbConfig = require('ssb-config')
const flotilla = require('@fraction/flotilla')

const server = flotilla({ ws: { http: false } })
server(ssbConfig)
