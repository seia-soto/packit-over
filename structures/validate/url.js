const { parse } = require('url')

const { protocols } = require('../../definitions')

module.exports = (url) => {
  const urlObject = parse(url)
  const isValideURL =
    (urlObject.protocol) &&
    (protocols.indexOf(urlObject.protocol) >= 0) &&
    (urlObject.host)

  urlObject.isValideURL = isValideURL

  return urlObject
}
