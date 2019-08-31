const Discord = require('discord.js')
const wiadomosc = '570335886546305054'

const roles = ['CTF Player', '1v1 Player', 'Climb/RunMode Player', 'LS Player', 'M79 coop Player', 'ZS Player']
const rolesEmoji = ['🇨', '🆚', '🇷', '🇱', '🇲', '<:zombie:533703686468272128>']

module.exports.run = async (client, message, args) => {
  const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
  };
  
  client.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;
  
    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id) || await user.createDM();
  
    if (channel.messages.has(data.message_id)) return;
  
    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    let reaction = message.reactions.get(emojiKey);
  
    if (!reaction) {
      const emoji = new Discord.Emoji(client.guilds.get(data.guild_id), data.emoji);
      reaction = new Discord.MessageReaction(message, emoji, 1, data.user_id === client.user.id);
    }
  
    client.emit(events[event.t], reaction, user);
  });

  client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.id === wiadomosc) {
      for (var i = 0; i < rolesEmoji.length; i++) {
        if (reaction.emoji == rolesEmoji[i]) {
          let rMember  = reaction.message.guild.members.get(user.id)
          let role = reaction.message.guild.roles.find(role => role.name === roles[i])
          if (rMember.roles.has(role.id)) return
          await (rMember.addRole(role.id))
          return
        }
      }
    }
  })
  
  client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.message.id === wiadomosc) {
      for (var i = 0; i < rolesEmoji.length; i++) {
        if (reaction.emoji == rolesEmoji[i]) {
          let rMember  = reaction.message.guild.members.get(user.id)
          let role = reaction.message.guild.roles.find(role => role.name === roles[i])
          if (!rMember.roles.has(role.id)) return
          await (rMember.removeRole(role.id))
          return
        }
      }
    }
  })
}

module.exports.help = {
  name: 'reactroles'
}
