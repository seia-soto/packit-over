const { request } = require('../structures')

request.http(process.argv.slice(2).join(''), {
  _obfuscateHeaders: 'all',
  _keepRedirectedSessions: true,
  _usePacketFragmentation: 64,
  headers: {}
})
  .then(data => console.log(data))
