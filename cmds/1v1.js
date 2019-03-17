const Discord = require('discord.js')
const fs = require('fs')
const channel1v1 = `546699178760208431`
var queue = [':bust_in_silhouette:', ':bust_in_silhouette:']
var players = []
var fOs = 0
var checkInt

module.exports.run = async (client, message, args) => {
  let PLAYER = message.member
  if (args[0] === 'add') {
    if (!warr(message)) return
    if (PLAYER.presence.status !== 'online') {
      return message.channel.send('You must be **Online** to use this command!')
    }
    if (players[0] === PLAYER.id) {
      message.channel.send('You cannot duel yourself! <:PepeHands:533754872785534999>')
      return
    }

    players.push(PLAYER.id)
    if (fOs !== 1) {
      checkInt = setInterval(() => { check(client, message) }, 1000)
    }
    queue[fOs] = `<@${players[fOs]}>`
    let embed = new Discord.RichEmbed()
      .setColor(Math.floor(Math.random() * 16777214) + 1)
      .setTitle(':vs: 1v1 match')
      .setDescription(`[${queue[0]}, ${queue[1]}]`)
    message.channel.send(embed)

    if (fOs === 1) {
      clearInterval(checkInt)
      queue = shuffle(queue)
      let embed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setTitle(':vs: 1v1 match between:')
        .addField('**1# Player**', `${queue[0]}`, true)
        .addField('**2# Player**', `${queue[1]}`, true)
        .setFooter('Please check your PMs for server information')
      message.channel.send(embed)

      for (var i in players) {
        let embed = new Discord.RichEmbed()
          .setColor(Math.floor(Math.random() * 16777214) + 1)
          .setTitle(':vs: 1v1 match')
          .addField('**Server info**', `<soldat://51.68.213.93:23081>`, true)
          .addField('**1# Player**', `${queue[0]}`)
          .addField('**2# Player**', `${queue[1]}`)
        client.users.get(players[i]).send(embed)
      }

      queue = [':bust_in_silhouette:', ':bust_in_silhouette:']
      fOs = 0
      players = []
    } else fOs++
    return
  }
  if (args[0] === 'del') {
    if (!warr(message)) return
    if (players.length === 1) {
      clearInterval(checkInt)
      if (players[0] !== PLAYER.id) return message.channel.send('You are not in the queue!')
      queue = [':bust_in_silhouette:', ':bust_in_silhouette:']
      players.pop()
      let embed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setTitle(':vs: 1v1 match')
        .setDescription(`[${queue[0]}, ${queue[1]}]`)
      message.channel.send(embed)
      fOs = 0
    } else {
      return message.channel.send('You are not in the queue!')
    }
    return
  }
  if (args[0] === 'status') {
    if (!warr(message)) return
    let embed = new Discord.RichEmbed()
      .setColor(Math.floor(Math.random() * 16777214) + 1)
      .setTitle(':vs: 1v1 match')
      .setDescription(`[${queue[0]}, ${queue[1]}]`)
    message.channel.send(embed)
    return
  }

  message.channel.send(
    'These commands can only be used in <#546699178760208431> channel\n' +
        '`!1v1 add` - to enter queue\n' +
        '`!1v1 del` - to leave queue\n' +
        '`!1v1 status` - to show current queue\n' +
        '_Please note, any user who will change his **status**, will be deleted from the queue automatically._'
  )
}

module.exports.help = {
  name: '1v1'
}

function check (client, message) {
  console.log('ok')
  if (players.length === 1) {
    let status = client.users.get(players[0]).presence.status
    if (status !== 'online') {
      clearInterval(checkInt)
      message.channel.send(`Player ${queue[0]} went **${status}** and was removed from the queue`)
      queue = [':bust_in_silhouette:', ':bust_in_silhouette:']
      players.pop()
      let embed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setTitle(':vs: 1v1 match')
        .setDescription(`[${queue[0]}, ${queue[1]}]`)
      message.channel.send(embed)
      fOs = 0
    }
  }
}

function warr (message) {
  if (message.channel.id !== channel1v1) {
    message.channel.send(`This command can only be used in <#${channel1v1}> channel`)
    return 0
  } else return 1
}

function shuffle (array) {
  var currentIndex = array.length; var temporaryValue; var randomIndex
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

// eslint-disable-next-line no-unused-vars
async function getRandomLine (filename) {
  let data = fs.readFileSync(filename, 'utf8')
  var lines = data.toString().split('\n')
  return lines[Math.floor(Math.random() * lines.length)]
}
