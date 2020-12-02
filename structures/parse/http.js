const { createDebugger } = require('../../utils')
const Response = require('../Response')

const debug = createDebugger('parse/http')

module.exports = fragments => {
  debug('resolving received packet fragments')

  const rawResponse = fragments.join('').split('\r\n')
  const response = new Response()
  // NOTE: resolve in following sequence;
  const resolvers = [
    'resolveProtocolHeader',
    'resolveHTTPHeader',
    'resolveHTTPBody'
  ]
  let resolverType = 0

  // NOTE: set rawResponse;
  response.rawResponse = rawResponse

  rawResponse.map((fragment, idx) => {
    const resolver = resolvers[resolverType]

    debug('resolving fragment:', fragment)

    if (fragment) {
      response[resolver](fragment)
    }
    if (!idx || !fragment) {
      const nextResolver = resolvers[resolverType + 1]

      if (nextResolver) {
        debug('switching to next resolver as we received \\r\\n\\r\\n signal:', nextResolver)

        resolverType++
      }
    }
  })

  return response
}
