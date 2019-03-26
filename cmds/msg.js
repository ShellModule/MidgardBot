/* eslint-disable eqeqeq */
/* eslint-disable no-extend-native */
/* eslint-disable no-useless-escape */
//  const Discord = require('discord.js')
const net = require('net')
const data = require('../passwords.json')

module.exports.run = async (client, message, args) => {
  if (!args[0]) return message.channel.send('Type `!msg help`')
  if (args[0] === 'help') {
    message.channel.send(
      '***FROM DISCORD TO SERVER:***\n' +
      '  **`!msg 1v1 <your message>`** - sends message to Midgard [1v1]\n' +
      '  **`!msg ctf <your message>`** - sends message to Midgard [CTF]\n' +
      '  **`!msg rm <your message>`** - sends message to Midgard [Run Mode]\n' +
      '  **`!msg climb <your message>`** - sends message to Midgard [Climb]\n' +
      '  **`!msg zrpg <your message>`** - sends message to Midgard [AlphaZRPG]\n'
    )
    return
  }
  for (var i in data) {
    if (args[0] === data[i].name2) {
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
        setTimeout(() => sock.end(), 2000)
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
