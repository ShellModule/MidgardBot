const net = require('net')
const fs = require('fs')
const data = require('../passwords.json')
const sockets = [ new net.Socket(), new net.Socket(), new net.Socket(), new net.Socket(), new net.Socket() ]

module.exports.run = async (client, message, args) => {
  var count = 0
  for (var i in data) {
    connect(sockets[count], data[i], client)
    count++
  }
  console.log('!msg from server: ACTIVE')
}

function connect (socket, info, client) {
  socket.connect(info.port + 10, info.ip)
  events(socket, info, client)
}

async function events (socket, info, client) {
  var global = await fs.readFileSync(`msg/from${info.name2}.txt`, 'utf8')
  var first = true

  socket.on('connect', () => {
    socket.write(`STARTFILES\r\nmaps/discord.pms\r\nENDFILES`)
  })

  socket.on('data', (data) => {
    if (data.toString().includes(global)) {
      console.log('poprzednia wiadomosc terminowana' + info.name + global)
      first = false
      socket.end()
    } else {
      if (data.toString().includes('discord.pms')) {
        console.log(info.name + global)
        let temp = StrCut(data.toString(), 'maps/discord.pms', 0).split('\n')
        global = temp[1]
        console.log(temp[2])
        if (!first) client.channels.get(`542063413677916162`).send('`' + info.name + ':` ' + temp[2])
        else first = false
      }
    }
  })

  socket.on('end', async () => {
    await fs.writeFile(`msg/from${info.name2}.txt`, global, (err) => {
      if (err) console.log(err + '\nwystapil blad w zapisywaniu do pliku')
    })
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
  name: 'server'
}
