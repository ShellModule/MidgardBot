/* eslint-disable eqeqeq */
/* eslint-disable no-extend-native */
/* eslint-disable no-useless-escape */
//  const Discord = require('discord.js')
const net = require('net')
const data = require('../passwords.json')
const flood = []

module.exports.run = async (client, message, args) => {
  if (!args[0]) return message.channel.send('Type `!msg help`')
  if (args[0] === 'help') {
    message.channel.send(
      '***FROM DISCORD TO SERVER:***\n' +
      '  **`!msg ctf <your message>`** - sends your message to Midgard [CTF]\n' +
      '  **`!msg ls <your message>`** - sends your message to (WM)Last Stand\n' +
      '  **`!msg m79 <your message>`** - sends your message to Midgard [CTF]\n' +
      '  **`!msg climb <your message>`** - sends your message to Midgard [M79 Coop]\n'
    )
    return
  }
  for (var i in data) {
    if (flood.indexOf(message.member.user.id) != -1) return message.channel.send('Antiflood')
    if (args[0] === data[i].name) {
      if (data[i].password === '') return message.channel.send('I cannot connect to the server')
      args = args.slice(1)
      if (!args[0]) return message.channel.send('You need to type in your message!')
      var sock = new net.Socket()
      let toSend = ''
      for (var j in args) {
        toSend = toSend + args[j] + ' '
      }

      sock.connect(data[i].port, data[i].ip)
      sock.on('connect', () => {
        sock.write(data[i].password + '\r\n')
        sock.write(`/say Discord[${message.member.user.username}] ${toSend}\r\n`)
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
