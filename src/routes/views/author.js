const template = require('./components/template')
const post = require('./components/post')

const {
  header,
  img,
  h1,
  section
} = require('hyperaxe')

module.exports = ({ avatarUrl, name, description, messages }) => {
  const authorHeader =
    header({ class: 'profile' },
      img({ class: 'avatar', src: avatarUrl }),
      h1(name)
    )

  const authorDescription =
    description !== '<p>null</p>\n'
      ? section({ class: 'message', innerHTML: description })
      : null

  return template(
    authorHeader,
    authorDescription,
    messages.map(msg =>
      post({ msg })
    )
  )
}
