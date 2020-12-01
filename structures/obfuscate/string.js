module.exports = text => {
  text = String(text)

  if (!text || typeof text !== 'string') {
    throw new Error('PACKIT_ERR_INVALID_OBFUSCATION_SOURCE_TYPE')
  }

  return text
    .split('')
    .map(char => (Math.random() >= 0.5) ? char.toUpperCase() : char.toLowerCase())
    .join('')
}
