'use strict'

const cooler = require('./lib/cooler')

module.exports = {
  isFollowing: async (feedId) => {
    const ssb = await cooler.connect()
    const { id } = ssb

    const isFollowing = await cooler.get(
      ssb.friends.isFollowing,
      {
        source: id,
        dest: feedId
      }
    )
    return isFollowing
  },
  getRelationship: async (feedId) => {
    const ssb = await cooler.connect()
    const { id } = ssb

    if (feedId === id) {
      return 'this is you'
    }

    const isFollowing = await cooler.get(
      ssb.friends.isFollowing,
      {
        source: id,
        dest: feedId
      }
    )

    const isBlocking = await cooler.get(
      ssb.friends.isBlocking,
      {
        source: id,
        dest: feedId
      }
    )

    if (isFollowing === true && isBlocking === false) {
      return 'you are following'
    } else if (isFollowing === false && isBlocking === true) {
      return 'you are blocking'
    } else if (isFollowing === false && isBlocking === false) {
      return 'you are not following or blocking'
    } else {
      return 'you are following and blocking (!)'
    }
  }
}
