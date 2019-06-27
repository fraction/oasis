const ejs = require('ejs')
const path = require('path')

module.exports = (filename, data) => new Promise((resolve, reject) => {
  const options = {}
  const target = path.join(__dirname, 'templates', filename + '.html')
  ejs.renderFile(target, data, options, (err, str) => {
    if (err) return reject(err)
    resolve(str)
  })
})
