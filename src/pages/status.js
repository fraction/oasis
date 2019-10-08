'use strict'

const meta = require('./models/meta')
const statusView = require('./views/status')
const fs = require('fs').promises
const path = require('path')

module.exports = async function statusPage ({ theme }) {
  const status = await meta.status()
  const pathParts = [__dirname, '..', '..', 'node_modules', '@fraction', 'base16-css', 'src']
  const fileNames = await fs.readdir(path.join(...pathParts))
  const themeNames = fileNames.map((fileName) => {
    const withoutPrefix = fileName.replace('base16-', '')
    const withoutSuffix = withoutPrefix.replace('.css', '')
    return withoutSuffix
  })

  return statusView({ status, theme, themeNames })
}
