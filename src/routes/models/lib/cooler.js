const ssbClient = require('ssb-client')

// a water cooler API
module.exports = {
  connect: function () {
    return new Promise((resolve, reject) => {
      ssbClient((err, api) => {
        if (err) reject(err)
        resolve(api)
      })
    })
  },
  /**
   * @param {function} method
   */
  get: function (method, ...opts) {
    return new Promise((resolve, reject) => {
      method(...opts, (err, val) => {
        if (err) return reject(err)
        resolve(val)
      })
    })
  },
  read: function (method, ...args) {
    return new Promise((resolve, reject) => {
      resolve(method(...args))
    })
  }
}
