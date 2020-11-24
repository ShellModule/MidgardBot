const Discord = require("discord.js");
const wiadomosc = "570335886546305054";

const roles = [
  "CTF Player",
  "1v1 Player",
  "LS Player",
  "M79 coop Player",
  "ZS Player",
  "HnS Player",
  "KO Player",
  "Runmode Player",
  "Climb Player",
  "OS Player",
];
const rolesEmoji = [
  "🇨",
  "🆚",
  "🇱",
  "🇲",
  "<:zombie:533703686468272128>",
  "🏃",
  "<:combat_knife:558336993390493733>",
  "🏃‍♀️",
  "🧗‍♂️",
  "<:m79:573199130411794432>",
];

module.exports.run = async (client, message, args) => {
  const events = {
    MESSAGE_REACTION_ADD: "messageReactionAdd",
    MESSAGE_REACTION_REMOVE: "messageReactionRemove",
  };

  client.on("raw", async (event) => {
    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = await client.users.fetch(data.user_id);
    const channel =
      client.channels.cache.get(data.channel_id) || (await user.createDM());

    if (channel.messages.cache.has(data.message_id)) return;

    const message = await channel.messages.fetch(data.message_id);
    const emojiKey = data.emoji.id
      ? `${data.emoji.name}:${data.emoji.id}`
      : data.emoji.name;
    let reaction = message.reactions.cache.get(emojiKey);

    if (!reaction) {
      const emoji = new Discord.Emoji(
        client.guilds.cache.get(data.guild_id),
        data.emoji
      );
      reaction = new Discord.MessageReaction(
        message,
        emoji,
        1,
        data.user_id === client.user.id
      );
    }

    await client.emit(events[event.t], reaction, user);
  });

  client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.message.id === wiadomosc) {
      for (var i = 0; i < rolesEmoji.length; i++) {
        if (reaction.emoji.name == rolesEmoji[i]) {
          reaction.message.guild.members.fetch(user.id).then((member) => {
            let role = reaction.message.guild.roles.cache.find(
              (role) => role.name === roles[i]
            );
            if (member.roles.cache.has(role.id)) {
              member.roles.remove(role.id);
            } else {
              member.roles.add(role.id);
            }
          });

          return;
        }
      }
    }
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    if (reaction.message.id === wiadomosc) {
      for (var i = 0; i < rolesEmoji.length; i++) {
        if (reaction.emoji.name == rolesEmoji[i]) {
          reaction.message.guild.members.fetch(user.id).then((member) => {
            let role = reaction.message.guild.roles.cache.find(
              (role) => role.name === roles[i]
            );
            if (member.roles.cache.has(role.id)) {
              member.roles.remove(role.id);
            } else {
              member.roles.add(role.id);
            }
          });

          return;
        }
      }
    }
  });
};

module.exports.help = {
  name: "reactroles",
};
