const defaultOptions = {
  private: true,
  reverse: true,
  meta: true
}

module.exports = (customOptions) =>
  Object.assign({}, customOptions, defaultOptions)
