const { Socket } = require('net')

const { createDebugger } = require('../../utils')
const { name, version } = require('../../package.json')
const compile = require('../compile')
const obfuscate = require('../obfuscate')
const validate = require('../validate')
const parse = require('../parse')
const Response = require('../Response')

const debug = createDebugger('request/http')

const httpRequest = (url = '', options = {}) => {
  const urlObject = validate.url(url)
  const rawRequest = compile.http(url, options)

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

      const response = parse.http(fragments)

      response.rawRequest = rawRequest
      response.options = options

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
            debug('supressing throwing error and keeping stacked sessions')

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
