const { httpRequest } = require('../structures')

httpRequest(process.argv.slice(2).join(''), {
  _obfuscateHeaders: 'all',
  _usePacketFragmentation: false,
  headers: {}
})
  .then(data => console.log(data))
