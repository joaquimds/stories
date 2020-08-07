const config = require('./config')

module.exports = {
  env: {
    title: 'Stories',
    description: 'Story Tree',
    siteUrl: config.site.url,
    shareImage: `${config.site.url}/tree.jpg`,
  },
}
