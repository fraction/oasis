const template = require('./components/template')
const post = require('./components/post')

module.exports = ({ messages }) => {
  return template(
    messages.map(msg =>
      post({ msg })
    )
  )
}
