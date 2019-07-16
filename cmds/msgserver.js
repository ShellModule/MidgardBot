const net = require('net')
const serversData = require('../serversData.json')
const options = require('../options.json')
const sockets = [ new net.Socket(), new net.Socket() ]
// const sockets = [ new net.Socket(), new net.Socket(), new net.Socket(), new net.Socket() ]

module.exports.run = async (client, message, args) => {
  var temp = [ serversData.ctf, serversData.ls ]
  for (var i in temp) {
    connect(sockets[i], temp[i], client)
  }
  console.log('!msg from server: ACTIVE')
}

function connect (socket, info, client) {
  socket.connect(info.port + 10, info.ip)
  events(socket, info, client)
}

async function events (socket, info, client) {
  var messageId = 'cyrtf6g786tyr45r68futluf6t765dI^R^*T&6ftrxityg;p68'
  var first = true
  var toSend = ''
  socket.on('connect', () => {
    socket.write(`STARTFILES\r\nmaps/discord.pms\r\nENDFILES`)
  })

  socket.on('data', (data) => {
    toSend = toSend + data.toString()
    if (toSend.includes('ENDFILES')) {
      if (toSend.includes(messageId)) {
        first = false
        toSend = ''
      } else {
        toSend = toSend.split('\n')
        messageId = toSend[2]
        if (!first) client.channels.get(options.msgsFromServers).send('`' + info.msgPrefix + ':` ' + toSend[3])
        else first = false
        toSend = ''
      }
      socket.end()
    }
  })

  socket.on('end', async () => {
    setTimeout(() => { socket.connect(info.port + 10, info.ip) }, 1000)
  })

  socket.on('error', () => {
    console.log(`Server Midgard ${info.name} is not available`)
    setTimeout(() => { socket.connect(info.port + 10, info.ip) }, 500)
  })
}

function StrCut (str, deli, offset) {
  let pos = str.indexOf(deli)
  return str.slice(pos + offset, str.length)
}

module.exports.help = {
  name: 'msgserver'
}
