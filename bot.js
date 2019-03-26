/* eslint-disable eqeqeq */
const Discord = require('discord.js')
const net = require('net')
const snekfetch = require('snekfetch')
const auth = require('./auth.json')
const fs = require('fs')
const prefix = '!'
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

const api = [
  { name: 'Midgard [1v1]', ip: '51.68.213.93', port: '23081', flag: ':flag_gb:', skrot: '1v1' },
  { name: 'Midgard [CTF]', ip: '188.166.44.152', port: '23073', flag: ':flag_nl:', skrot: 'ctf' },
  { name: 'Midgard [Final Bout]', ip: '162.221.187.210', port: '25020', flag: ':flag_us:', skrot: 'finalbout' },
  { name: 'Midgard [HTF]', ip: '162.221.187.210', port: '25000', flag: ':flag_us:', skrot: 'htf' },
  { name: 'Midgard [Run Mode]', ip: '51.68.213.93', port: '23080', flag: ':flag_gb:', skrot: 'runmode' },
  { name: 'Midgard [Climb]', ip: '51.68.213.93', port: '23082', flag: ':flag_gb:', skrot: 'climb' },
  { name: 'Midgard [AlphaZRPG]', ip: '51.68.213.93', port: '23083', flag: ':flag_gb:', skrot: 'zrpg' }
]
module.exports = { apiExport: api }

const getStatusURL = (ip, port) => `https://api.soldat.pl/v0/server/${ip}/${port}`
const getPlayersURL = (ip, port) => `https://api.soldat.pl/v0/server/${ip}/${port}/players`
const channelStatus = `543448415091032065`
const types = [ 'name', 'kills', 'deaths', 'team' ]

var serversInfo
var playersInfo

client.on('ready', () => {
  console.log(`Bot is ready! ${client.user.username} ` + new Date())
  client.user.setActivity('!cmdhelp for help', { type: 'PLAYING' })
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
            '  **`!ctfstatus`** - *detailed information on **Midgard [CTF]** server*\n' +
            '  **`!cmdhelp`** - *to show our commands at any time*\n' +
            '  **`!msg help`** - *how to send a message to our servers*\n' +
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
  if (command === '!server') return console.log('spierdalaj :)')

  let cmd = client.commands.get(command.slice(prefix.length))
  if (cmd) cmd.run(client, message, args)
})

async function status (data, embed, ava) {
  for (var i in api) {
    if (api[i].name === ava) {
      embed = main(data, embed)
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
        api[i].flag + '**' + api[i].name + '**',
        '**Address**: ' + `<soldat://${api[i].ip}:${api[i].port}>\n` +
      (serversInfo[0] > 0 ? ':fire: ' : '') + '**Players:** `' + (serversInfo[0] === 'N/A' ? 'N/A' : serversInfo[0] + '/' + serversInfo[1]) + '`<:crouch:533700465670619197> ' +
      '**Map:** `' + serversInfo[2] + '`:map:\n' +
      (playersInfo.Players.filter(v => { return v !== 'Zombie' }) != '' ? '```\n' + playersInfo.Players.filter(v => { return v !== 'Zombie' }).join('  |  ') + '\n```' : '')
      )
    }
  }
  embed.setTimestamp(new Date())

  client.channels.get(`${channelStatus}`).send(embed)
}

async function getData (url) {
  return snekfetch.get(url).then(t => {
    return t.body
  })
}

function start () {
  let embed = new Discord.RichEmbed()
    .setAuthor(client.user.username, client.user.avatarURL)
    .setColor(Math.floor(Math.random() * 16777214) + 1)

  var sock = new net.Socket()

  sock.connect(parseInt(api[1].port, 10) + 10, api[1].ip)

  sock.on('connect', () => {
    sock.write('STARTFILES\r\nlogs/gamestat.txt\r\nENDFILES\r\n')
  })

  sock.on('data', (data) => {
    if (data.length > 12) {
      var temp = StrCut(data.toString(), 'Players', 0)
      status(temp.split('\n'), embed, api[1].name)
    }
    if (data.toString().includes('ENDFILES')) {
      sock.destroy()
    }
  })

  sock.on('error', () => {
    console.log('Midgard [CTF] is unavailable')
    status('', embed, '')
    sock.destroy()
  })
}

async function update () {
  let fetched = await client.channels.get(`${channelStatus}`).fetchMessages({ limit: 10 })
  client.channels.get(`${channelStatus}`).bulkDelete(fetched)
  start()
}

function main (data, embed) {
  let gamestat = new Dane(data)
  let embedF = embed

  let Alpha = ''
  let Bravo = ''
  let Spec = ''
  let PlayersSorted = sortByKey(gamestat.PlayersInfo, 'kills')
  for (var i in PlayersSorted) {
    let toAdd = PlayersSorted[i].kills + '/' +
                  PlayersSorted[i].deaths + ' ' +
                  PlayersSorted[i].name + '\n'
    if (PlayersSorted[i].team === '1') {
      Alpha = Alpha + toAdd
    } else if (PlayersSorted[i].team === '2') {
      Bravo = Bravo + toAdd
    } else if (PlayersSorted[i].team === '5') {
      Spec = Spec + StrCut(toAdd, ' ', 1)
    }
  }
  embedF
    .addField(
      api[1].flag + `**${api[1].name}**`, '**Address:** ' + `<soldat://${api[1].ip}:${api[1].port}>\n` +
      (gamestat.PlayersNum > 0 ? ':fire: ' : '') + '**Players:** `' + gamestat.PlayersNum + '/14`<:crouch:533700465670619197> ' +
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
