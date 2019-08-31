const net = require('net')
const serversData = require('../serversData.json')
const flood = []

module.exports.run = async (client, message, args) => {
  if (!args[0]) return message.channel.send('Type `!msg help`')
  if (args[0] === 'help') {
    message.channel.send(
      '***FROM DISCORD TO SERVER:***\n' +
      '  **`!msg ctf <your message>`** - sends your message to Midgard [CTF]\n'
      // '  **`!msg ls <your message>`** - sends your message to (WM)Last Stand\n' 
      // '  **`!msg m79 <your message>`** - sends your message to Midgard [CTF]\n' +
      // '  **`!msg climb <your message>`** - sends your message to Midgard [M79 Coop]\n'
    )
    return
  }
  for (var i in serversData) {
    if (flood.indexOf(message.member.user.id) != -1) return message.channel.send('Antiflood')
    if (args[0] === serversData[i].shortName) {
      if (serversData[i].password === '') return message.channel.send('I cannot connect to the server')
      args = args.slice(1)
      if (!args[0]) return message.channel.send('You need to type in your message!')
      var sock = new net.Socket()
      let toSend = ''
      for (var j in args) {
        toSend = toSend + args[j] + ' '
      }
      if(toSend.includes("\n")) {
        toSend = StrCut(toSend,"\n",0);
      }

      sock.connect(serversData[i].port, serversData[i].ip)
      sock.on('connect', () => {
        sock.write(serversData[i].password + '\r\n')
        sock.write(`/say Discord[${message.member.user.username}] ${toSend}\r\n`)
        message.react("📨")
        flood.push(message.member.user.id)
        setTimeout(() => sock.destroy(), 3000)
      })

      sock.on('close', () => {
        let pos = flood.indexOf(message.member.user.id)
        if (pos != -1) {
          flood.splice(pos, 1)
        }
      })

      sock.on('error', () => {
        message.channel.send('Server is unavailable ')
      })
      return
    }
  }
  message.channel.send('Type `!msg help`')
}

module.exports.help = {
  name: 'msg'
}

function StrCut(str, deli, offset) {
  let pos = str.indexOf(deli);
  return str.slice(0, pos + offset);
}