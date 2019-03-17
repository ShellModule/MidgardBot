const dgram = require('dgram')
const socket = dgram.createSocket('udp4')

module.exports.run = async (client, message, args) => {
  let temp = socket.send('REFRESH', 25660, '138.201.55.232', (err, temp) => {
    console.log(err)
    console.log(temp)
    socket.close()
  })
  console.log(temp)
}

module.exports.help = {
  name: 'test'
}
