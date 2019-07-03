const vote = require('./models/vote')

module.exports = async function like ({ message, voteValue }) {
  const value = Number(voteValue)
  return vote.publish(message, value)
}
