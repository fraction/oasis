'use strict'

const meta = require('./models/meta')
const statusView = require('./views/status')
const fs = require('fs').promises
const path = require('path')

module.exports = async function statusPage ({ theme }) {
  const status = await meta.status()

  // TODO: make `main` property in @fraction/base16-css
  const moduleName = '@fraction/base16-css'
  const randomTheme = 'monokai'
  const requirePath = `${moduleName}/src/base16-${randomTheme}.css`

  const filePath = require.resolve(requirePath)
  const dirPath = path.dirname(filePath)
  const fileNames = await fs.readdir(dirPath)

  const themeNames = fileNames.map((fileName) => {
    const withoutPrefix = fileName.replace('base16-', '')
    const withoutSuffix = withoutPrefix.replace('.css', '')
    return withoutSuffix
  })

  return statusView({ status, theme, themeNames })
}
