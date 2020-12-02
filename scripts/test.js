const { request } = require('../structures')

request.http(process.argv.slice(2).join(''), {
  _obfuscateHeaders: 'all',
  _keepRedirectedSessions: true,
  _usePacketFragmentation: true,
  headers: {}
})
  .then(data => console.log(data))
