'use strict'

const meta = require('./models/meta')
const statusView = require('./views/status')

module.exports = async function statusPage ({ theme }) {
  const status = await meta.status()

  return statusView({ status, theme })
}
