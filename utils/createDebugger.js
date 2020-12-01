const debug = require('debug')

const { name } = require('../package')

module.exports = subdomain => {
  let domain = name

  if (subdomain) domain += ':' + subdomain

  return debug(domain)
}
