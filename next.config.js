const config = require('./config')

module.exports = {
  env: {
    title: 'Tree of Tales',
    description: 'A garden of forking paths.',
    siteUrl: config.site.url,
    shareImage: `${config.site.url}/tree.jpg`,
  },
}
