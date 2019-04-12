/* eslint-disable eqeqeq */
const Discord = require('discord.js')
const net = require('net')
const snekfetch = require('snekfetch')
const auth = require('./auth.json')
const api = require('./passwords.json')
const options = require('./options.json')
const fs = require('fs')
const prefix = options.prefix
const client = new Discord.Client()
client.commands = new Discord.Collection()

fs.readdir('./cmds/', (err, files) => {
  if (err) console.log(err)

  let cmdfiles = files.filter(f => f.split('.').pop() === 'js')
  if (cmdfiles.length <= 0) {
    console.log('Brak plików do załadowania!')
    return
  }

  cmdfiles.forEach((f, i) => {
    let props = require(`./cmds/${f}`)
    console.log(`${i + 1}: ${f} zaladowany!`)
    client.commands.set(props.help.name, props)
  })
})

const getStatusURL = (ip, port) => `https://api.soldat.pl/v0/server/${ip}/${port}`
const getPlayersURL = (ip, port) => `https://api.soldat.pl/v0/server/${ip}/${port}/players`
const types = [ 'name', 'kills', 'deaths', 'team' ]

var serversInfo
var playersInfo

client.on('ready', () => {
  console.log(`Bot is ready! ${client.user.username} ` + new Date())
  client.user.setActivity('!cmdhelp for help', { type: 'PLAYING' })
  // let cmd = client.commands.get('server')
  // if (cmd) cmd.run(client, '', '')
  update()
  setInterval(update, 60000)
})

client.on('guildMemberAdd', (guildMember) => {
  guildMember.addRole(guildMember.guild.roles.find(role => role.name === 'Midgard Member')).catch(() => {
    console.log('Something went wrong with granting "Midgard Member" role')
  })
  guildMember.send(
    `Welcome to **Midgard Soldat** <@${guildMember.id}>!\n\n` +
        '__List of available commands on our server:__\n' +
            '  **`!invitelink`** - *link to our discord server*\n' +
            '  **`!roles`** - *how to get a role*\n' +
            '  **`!linkfix`** - *if links like this one <soldat://localhost:23073/pass>, doesnt work*\n' +
            '  **`!1v1`** - *1v1 matchmaking*\n' +
            '  **`!status`** - *detailed information on some servers*\n' +
            '  **`!cmdhelp`** - *to show our commands at any time*\n' +
    //  '  **`!msg help`** - *how to send a message to our servers*\n' +
        '\n***MIDGARD SERVERS***\n<#537011480973934592>\n\n' +
        'You can also check <#533697790187012098> for more information'
  )
})

client.on('message', async message => {
  if (message.channel.type === 'dm') return

  const messageArray = message.content.split(' ')
  const command = messageArray[0]
  const args = messageArray.slice(1)

  if (!command.startsWith(prefix)) return
  if (command === 'server') return
  let cmd = client.commands.get(command.slice(prefix.length))
  if (cmd) cmd.run(client, message, args)
})

async function update () {
  let fetched = await client.channels.get(options.statusChannel).fetchMessages({ limit: 10 })
  client.channels.get(options.statusChannel).bulkDelete(fetched)
  start()
}

function start () {
  let embed = new Discord.RichEmbed()
    .setAuthor(client.user.username, client.user.avatarURL)
    .setColor(Math.floor(Math.random() * 16777214) + 1)

  var sock = new net.Socket()

  sock.connect(parseInt(api.ctf.port, 10) + 10, api.ctf.ip)

  sock.on('connect', () => {
    sock.write('STARTFILES\r\nlogs/gamestat.txt\r\nENDFILES\r\n')
  })

  sock.on('data', (data) => {
    if (data.length > 12) {
      var temp = StrCut(data.toString(), 'Players', 0)
      start2(temp.split('\n'), embed, api.ctf.name)
    }
    if (data.toString().includes('ENDFILES')) {
      sock.destroy()
    }
  })
  sock.on('error', () => {
    console.log('Midgard [CTF] is unavailable')
    start2('', embed, '')
    sock.destroy()
  })
}

function start2 (data1, embed, ava1) {
  var sock = new net.Socket()

  sock.connect(api.ls.port + 10, api.ls.ip)

  sock.on('connect', () => {
    sock.write('STARTFILES\r\nlogs/gamestat.txt\r\nENDFILES\r\n')
  })

  sock.on('data', (data) => {
    if (data.length > 12) {
      var temp = StrCut(data.toString(), 'Players', 0)
      status(data1, temp.split('\n'), embed, ava1, api.ls.name)
    }
    if (data.toString().includes('ENDFILES')) {
      sock.destroy()
    }
  })

  sock.on('error', () => {
    console.log('Midgard [CTF] is unavailable')
    status(data1, '', embed, ava1, '')
    sock.destroy()
  })
}

async function status (dataCTF, dataLS, embed, avaCTF, avaLS) {
  for (var i in api) {
    if (api[i].name === avaCTF) {
      embed = main(dataCTF, embed, api[i])
    } else if (api[i].name === avaLS) {
      embed = main(dataLS, embed, api[i])
    } else {
      try {
        serversInfo = await getData(getStatusURL(api[i].ip, api[i].port))
      } catch (e) {
        serversInfo = ['N/A', 'N/A', 'N/A']
        console.log(`!!ERROR!! POBIERANIE DANYCH Z LOBBY - ${api[i].name} ` + new Date())
      }
      if (serversInfo[0] !== 'N/A') {
        serversInfo = [serversInfo.NumPlayers, serversInfo.MaxPlayers, serversInfo.CurrentMap]
        playersInfo = await getData(getPlayersURL(api[i].ip, api[i].port))
      }

      embed.addField(
        api[i].flag + '**' + api[i].name2 + '**',
        '**Address**: ' + `<soldat://${api[i].ip}:${api[i].port}>\n` +
      (serversInfo[0] > 0 ? ':fire: ' : '') + '**Players:** `' + (serversInfo[0] === 'N/A' ? 'N/A' : serversInfo[0] + '/' + serversInfo[1]) + '`<:crouch:533700465670619197> ' +
      '**Map:** `' + serversInfo[2] + '`:map:\n' +
      (playersInfo.Players.filter(v => { return v !== 'Zombie' }) != '' ? '```\n' + playersInfo.Players.filter(v => { return v !== 'Zombie' }).join('  |  ') + '\n```' : '')
      )
    }
  }
  embed.setTimestamp(new Date())

  client.channels.get(options.statusChannel).send(embed)
}

async function getData (url) {
  return snekfetch.get(url).then(t => {
    return t.body
  })
}

function main (data, embed, server) {
  let gamestat = new Dane(data)
  let embedF = embed

  let Alpha = ''
  let Bravo = ''
  let PlayerCounter = 0
  let Spec = ''
  let PlayersSorted = sortByKey(gamestat.PlayersInfo, 'kills')
  for (var i in PlayersSorted) {
    let toAdd = PlayersSorted[i].kills + '/' +
                  PlayersSorted[i].deaths + ' ' +
                  PlayersSorted[i].name + '\n'
    if (PlayersSorted[i].team === '1') {
      Alpha = Alpha + toAdd
    } else if (PlayersSorted[i].team === '2') {
      PlayerCounter++
      Bravo = Bravo + toAdd
    } else if (PlayersSorted[i].team === '5') {
      PlayerCounter++
      Spec = Spec + StrCut(toAdd, ' ', 1)
    }
  }
  if (server.name === '[CTF]') {
    embedF
      .addField(
        server.flag + `**${server.name2}**`, '**Address:** ' + `<soldat://${server.ip}:${server.port}>\n` +
      (gamestat.PlayersNum > 0 ? ':fire: ' : '') + '**Players:** `' + gamestat.PlayersNum + '/14 `<:crouch:533700465670619197> ' +
      '**Map:** `' + gamestat.Map + '`:map:\n' +
      '**Timeleft:** ' + '`' + gamestat.Timeleft + '`:alarm_clock: ' +
      '**Score:** ' + '`' + gamestat.Alpha + ' : ' + gamestat.Bravo + '`:checkered_flag:'
      )
    if (gamestat.PlayersNum > 0) {
      embedF
        .addField('<:redflag:533700464856924181>' + '**Alpha**', (Alpha != '' ? '```\n' + Alpha + '\n```' : '**`Alpha is empty!`**'), true)
        .addField('<:blueflag:533700465142267905>' + '**Bravo**', (Bravo != '' ? '```\n' + Bravo + '\n```' : '**`Bravo is empty!`**'), true)
      if (Spec != '') {
        embedF.addField(':flag_black:' + '**Spectators**', (Spec != '' ? '```\n' + Spec + '\n```' : 'Spectators are empty!'))
      }
    }
  }
  if (server.name === '[LS]') {
    embedF
      .addField(
        server.flag + `**${server.name2}**`, '**Address:** ' + `<soldat://${server.ip}:${server.port}>\n` +
    (gamestat.PlayersNum > 0 ? ':fire: ' : '') + '**Players:** `' + PlayerCounter + '/6 `<:crouch:533700465670619197> ' +
    '**Map:** `' + gamestat.Map + '`:map:\n'
      )
    if (PlayerCounter > 0) {
      embedF
        .addField('<:blueflag:533700465142267905>' + '**Survivors**', (Bravo != '' ? '```\n' + Bravo + '\n```' : '**`No survivors!`**'))
      if (Spec != '') {
        embedF.addField(':flag_black:' + '**Spectators**', (Spec != '' ? '```\n' + Spec + '\n```' : 'Spectators are empty!'))
      }
    }
  }

  return embedF
}

function sortByKey (array, key) {
  return array.sort(function (a, b) {
    var x = parseInt(a[key], 10); var y = parseInt(b[key], 10)
    return ((x < y) ? 1 : ((x > y) ? -1 : 0))
  })
}

function StrCut (str, deli, offset) {
  let pos = str.indexOf(deli)
  return str.slice(pos + offset, str.length)
}

class Dane {
  constructor (data) {
    this.data = data
  }

  get PlayersNum () {
    return StrCut(this.data[0], ' ', 1)
  }
  get Map () {
    return StrCut(this.data[1], ' ', 1)
  }
  get Timeleft () {
    return StrCut(this.data[3], ' ', 1)
  }
  get Alpha () {
    return StrCut(this.data[4], ' ', 4)
  }
  get Bravo () {
    return StrCut(this.data[5], ' ', 4)
  }
  get PlayersInfo () {
    var arr = []
    for (var i = 9; i < this.data.length - 2; i = i + 5) {
      let obj = {}
      for (var j = 0; j < 4; j++) {
        obj[types[j]] = this.data[i + j]
      }
      arr.push(obj)
    }
    return arr
  }
}

client.login(auth.token)
