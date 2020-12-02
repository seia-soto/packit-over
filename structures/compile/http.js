const { Socket } = require('net')
const url = require('url')

const { createDebugger } = require('../../utils')
const { name, version } = require('../../package.json')
const validate = require('../validate')
const parse = require('../parse')
const obfuscate = require('../obfuscate')
const Response = require('../Response')

const debug = createDebugger('compile/http')

module.exports = (url = '', options = {}) => {
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

  return rawRequest
}
