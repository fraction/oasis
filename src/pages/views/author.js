const template = require('./components/template')
const post = require('./components/post')

const {
  article,
  header,
  img,
  h1,
  section
} = require('hyperaxe')

module.exports = ({ avatarUrl, name, description, messages }) => {
  const prefix = section({ class: 'message' },
    header({ class: 'profile' },
      img({ class: 'avatar', src: avatarUrl }),
      h1(name)
    ),
    description !== '<p>null</p>\n'
      ? article({ innerHTML: description })
      : null
  )

  return template(
    prefix,
    messages.map(msg =>
      post({ msg })
    )
  )
}
