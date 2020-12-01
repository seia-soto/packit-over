const isObject = require('../isObject')

module.exports = headers => {
  const error = new Error('PACKIT_ERR_INVALID_REQUEST_HEADERS_TYPE')

  if (!isObject(headers)) {
    throw error
  }

  const modified = {}
  const headerNames = Object.keys(headers)

  for (let i = 0, l = headerNames.length; i < l; i++) {
    const headerName = headerNames[i]
    const header = headers[headerName]

    if (headerName.match(/[^\w-]/gi)) {
      throw error
    }

    modified[headerName.toLowerCase()] = header.toLowerCase()
  }

  return modified
}
