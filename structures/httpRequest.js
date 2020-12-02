const { Socket } = require('net')
const url = require('url')

const { createDebugger } = require('../utils')
const { name, version } = require('../package.json')
const validate = require('./validate')
const obfuscate = require('./obfuscate')
const Response = require('./Response')

const debug = createDebugger('http')

const httpRequest = (url = '', options = {}) => {
  const urlObject = validate.url(url)

  if (!urlObject.isValideURL) {
    throw new Error('PACKIT_ERR_INVALID_REQUEST_URL')
  }

  // NOTE: prepare options;
  options._packit = options._packit || {
    stacks: [],
    redirects: 0
  }
  options._httpVersion = options.httpVersion || '1.1'
  options._obfuscateHeaders = options._obfuscateHeaders || 'host'
  options._usePacketFragmentation = options._usePacketFragmentation || false
  options._maxRedirect = options._maxRedirect || 5
  options._keepRedirectedSessions = options._keepRedirectedSessions || false
  options.method = options.method || 'GET'
  options.headers = options.headers || {}
  options.body = options.body || ''

  // NOTE: prepare headers object;
  debug('validating received headers object and compiling with required HTTP headers')

  options.headers = validate.headers(options.headers)

  // NOTE: part=request headers;
  debug('compiling essential request headers')

  options.headers.host = urlObject.host
  options.headers['accept-encoding'] = 'identify' // NOTE: without compression;
  // NOTE: part=request headers (editable);
  debug('compiling user-editable request headers')

  options.headers['user-agent'] = options.headers['user-agent'] || `Seia-Soto/${name} v${version}`
  options.headers.accept = options.headers.accept || 'text/html'
  // NOTE: part=general headers;
  debug('compiling general headers')

  options.headers.connection = 'close'

  if (urlObject.port) {
    options.headers.host += ':' + urlObject.port
  }
  if (options._obfuscateHeaders) {
    debug('obfuscating headers:', options._obfuscateHeaders)

    options.headers = obfuscate.headers(options.headers, options._obfuscateHeaders)
  }

  // NOTE: prepare network transaction;
  debug('compiling HTTP packet')

  const rawRequest = []

  debug('defining HTTP packet header')

  rawRequest.push(`${options.method.toUpperCase()} ${urlObject.path || '/'} HTTP/${options._httpVersion}`)

  // NOTE: put headers;
  debug('defining HTTP headers')

  const headerNames = Object.keys(options.headers)

  for (let i = 0, l = headerNames.length; i < l; i++) {
    const headerName = headerNames[i]
    const header = options.headers[headerName]

    debug(`> ${headerName}: ${header}`)

    rawRequest.push(`${headerName}:${header}`)
  }

  // NOTE: put body;
  if (options.body) {
    debug('defining HTTP body')

    // NOTE: put empty line before body;
    rawRequest.push('')
    rawRequest.push(options.body)
  }

  // NOTE: complete request(\r\n\r\n);
  debug('completing packet with \\r\\n\\r\\n signal')

  rawRequest.push('')
  rawRequest.push('')

  return new Promise((resolve, reject) => {
    // NOTE: request;
    debug('creating new socket to send the packet')

    const client = new Socket()
    const packet = rawRequest.join('\r\n')
    const fragments = []

    client.connect(urlObject.port || 80, urlObject.host, () => {
      debug('connection established with the remote server')

      // NOTE: packet fragmentation;
      if (options._usePacketFragmentation) {
        debug('fragmenting the HTTP packet with rate(char):', options._usePacketFragmentation)

        for (let i = 0, l = packet.length; i < l; i += options._usePacketFragmentation) {
          const part = packet.slice(i, i + options._usePacketFragmentation)

          debug('sending the part of packet')

          client.write(Buffer.from(part))
        }
      } else {
        debug('sending the packet without packet fragmentation')

        client.write(Buffer.from(packet))
      }
    })
    client.on('data', data => {
      debug('received data from remote server:', data)

      fragments.push(data.toString('utf8'))
    })
    client.on('close', () => {
      debug('remote server closed the connection')
      debug('resolving received packet fragments')

      const rawResponse = fragments.join('').split('\r\n')
      const response = new Response(options)
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

      const isRedirect =
        (response.status.code === 301 || response.status.code === 302 || response.status.code === 307) &&
        (response.headers.location)

      if (isRedirect) {
        debug('detected redirection request from server')

        // NOTE: stack current session;
        if (options._keepRedirectedSessions) {
          debug('stacking current session')

          options._packit.stacks.push(response._packitStack())
        }

        debug('updating current redirect count:', options._packit.redirects)

        options._packit.redirects++

        // NOTE: check if current redirect count reached out max redirect;
        if (options._packit.redirects >= options._maxRedirect) {
          debug('preventing additional redirect because client reached max redirect limit')

          if (options._keepRedirectedSessions) {
            resolve(response)
          } else {
            throw new Error('PACKIT_ERR_MAX_REDIRECT_REACHED')
          }
        } else {
          // NOTE: check if redirection contains full url and patch it;
          let location = response.headers.location

          if (!validate.url(location)) {
            debug('patching redirect destination url because the url provided is not full url')

            location = `${urlObject.protocol}//${urlObject.host}${urlObject.path}`
          }

          debug('handling redirect and passing current session:', response.headers.location)

          // NOTE: resolve with another promise;
          resolve(httpRequest(response.headers.location, options))
        }
      } else {
        resolve(response)
      }
    })
  })
}

module.exports = httpRequest
