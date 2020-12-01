class Response {
  constructor (buffer) {
    this.rawResponse = buffer

    this.headers = {}
    this.status = {
      code: -1,
      message: 'unavailable'
    }
  }

  setStatus (code, message) {
    this.status = {
      code,
      message
    }
  }
  setHeader (key, value) {
    if (!key) {
      return
    }

    this.headers[key.trim().toLowerCase()] = value.trim()
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
    const [key, ...value] = fragment.split(' ')

    this.setHeader(key, value.join(' '))
  }
  resolveHTTPBody (fragment) {
    this.text = this.text || ''

    this.text += fragment
  }
}

module.exports = Response
