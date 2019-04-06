/* eslint-disable eqeqeq */
const Discord = require('discord.js')
const net = require('net')
const data = require('../passwords.json')
const types = [ 'name', 'kills', 'deaths', 'team' ]

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

module.exports.run = async (client, message, args) => {
  var sock = new net.Socket()

  sock.connect(data.ctf.port + 10, data.ctf.ip)

  sock.on('connect', async () => {
    sock.write('STARTFILES\r\nlogs/gamestat.txt\r\nENDFILES\r\n')
  })

  sock.on('data', (data) => {
    if (data.length > 12) {
      var temp = StrCut(data.toString(), 'Players', 0)
      main(temp.split('\n'), message)
    }
    if (data.toString().includes('ENDFILES')) {
      sock.destroy()
    }
  })

  sock.on('error', () => {
    message.channel.send('**Midgard [CTF]** is unavailable <:PepeHands:533754872785534999>')
    sock.destroy()
  })
}

function main (data, message) {
  const gamestat = new Dane(data)

  var Alpha = ''
  var Bravo = ''
  var Spec = ''
  var PlayersSorted = sortByKey(gamestat.PlayersInfo, 'kills')
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
  var Deadliest = bestKDRatio(gamestat.PlayersInfo)
  let embed = new Discord.RichEmbed()
    .setColor(Math.floor(Math.random() * 16777214) + 1)
    .setTitle(data.ctf.flag + `**${data.ctf.name2}**`)
    .addField(':map:' + '**Map**', '**`' + gamestat.Map + '`**', true)
    .addField(':alarm_clock:' + '**Timeleft**', '**`' + gamestat.Timeleft + '`**', true)
  if (Spec != '') {
    embed.addField(':flag_black:' + '**Spectators**', (Spec != '' ? '```\n' + Spec + '\n```' : 'Spectators are empty!'))
  }
  embed
    .addField(':checkered_flag:' + '**Score**', '**`' + gamestat.Alpha + ' : ' + gamestat.Bravo + '`**')
    .addField('<:redflag:533700464856924181>' + '**Alpha**', (Alpha != '' ? '```\n' + Alpha + '\n```' : '**`Alpha is empty!`**'), true)
    .addField('<:blueflag:533700465142267905>' + '**Bravo**', (Bravo != '' ? '```\n' + Bravo + '\n```' : '**`Bravo is empty!`**'), true)
    .setTimestamp(new Date())
  if (gamestat.PlayersNum >= 2 && gamestat.KiDe != 0) {
    embed.addField('<:crouch:533700465670619197>**Deadliest**', `<:uszanowanko:533764245339373588>` + Deadliest.Player)
  }
  message.channel.send(embed)
}

function sortByKey (array, key) {
  return array.sort(function (a, b) {
    var x = parseInt(a[key], 10); var y = parseInt(b[key], 10)
    return ((x < y) ? 1 : ((x > y) ? -1 : 0))
  })
}

function bestKDRatio (array) {
  var best = { 'KiDe': 0, 'Player': '' }
  var temp = 0
  for (var i in array) {
    temp = parseInt(array[i].kills, 10)
    if (temp > best.KiDe) {
      best.KiDe = temp
      best.Player = array[i].name
    }
  }
  return best
}

function StrCut (str, deli, offset) {
  let pos = str.indexOf(deli)
  return str.slice(pos + offset, str.length)
}
module.exports.help = {
  name: 'ctfstatus'
}
