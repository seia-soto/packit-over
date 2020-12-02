class Response {
  constructor (options) {
    this.options = options
    this.rawResponse = []

    this.headers = {}
    this.status = {
      code: -1,
      message: 'unavailable'
    }
    // this.text
  }

  _packitStack () {
    const currentSession = JSON.parse(JSON.stringify(this))

    currentSession.options._packit.stacks = 'you cannot access to previous stacks via stacked item'

    return currentSession
  }

  setStatus (code, message) {
    this.status = {
      code: Number(code),
      message
    }
  }
  setHeader (key, value) {
    if (!key) {
      return
    }

    this.headers[key.trim().toLowerCase()] = value.trim()
  }

  getHeader (key) {
    return this.headers[key.trim().toLowerCase()]
  }

  resolveProtocolHeader (fragment) {
    const [httpVersion, responseCode, ...responseMessage] = fragment.split(' ')

    if (!httpVersion.startsWith('HTTP/')) {
      throw new Error('PACKIT_ERR_INVALID_HTTP_HEADER')
    }

    this.httpVersion = httpVersion

    this.setStatus(responseCode, responseMessage.join(' '))
  }
  resolveHTTPHeader (fragment) {
    const [key, ...value] = fragment.split(':')

    this.setHeader(key, value.join(':'))
  }
  resolveHTTPBody (fragment) {
    this.text = this.text || ''

    this.text += fragment
  }
}

module.exports = Response
