const template = require('./components/template')
const post = require('./components/post')

module.exports = ({ msgs }) => {
  return template(
    msgs.map(msg =>
      post({ msg })
    )
  )
}
