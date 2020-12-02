const obfuscateString = require('./string')

const obfuscationLevels = [
  'all',
  'host'
]

module.exports = (headers, level) => {
  if (obfuscationLevels.indexOf(level) < 0) {
    throw new Error('PACKIT_ERR_INVALID_REQUEST_HEADERS_OBFUSCATION_LEVEL')
  }

  const modified = {}
  const headerNames = Object.keys(headers)

  for (let i = 0, l = headerNames.length; i < l; i++) {
    const headerName = headerNames[i]
    const header = headers[headerName]

    if (level === 'all') {
      modified[obfuscateString(headerName)] = headerName.toLowerCase() === 'host'
        ? obfuscateString(header)
        : header
    } else if (level === 'host' && headerName.toLowerCase() === 'host') {
      modified[obfuscateString(headerName)] = obfuscateString(header)
    } else {
      modified[headerName] = header
    }
  }

  return modified
}
