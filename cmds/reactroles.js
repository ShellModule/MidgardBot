const options = require("../options.json");

const roles = {
  "🇨": "541951142288949272",
  "🆚": "545923070905417729",
  "🇱": "566257037617397770",
  "🇲": "573150284533071882",
  "🏃": "633240652951322624",
  combat_knife: "657306617230000148",
  "🏃‍♀️": "744135682917793842",
  "🧗‍♂️": "744135750857129984",
  m79: "755149710162919464",
};

module.exports.run = async (client, message, args) => {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();

    if (user.bot) return;
    if (!reaction.message.guild) return;

    if (reaction.message.channel.id === options.reactRolesChannel) {
      for (const [key, value] of Object.entries(roles)) {
        if (reaction.emoji.name == key) {
          await reaction.message.guild.members.cache
            .get(user.id)
            .roles.add(value);
        }
      }
    }
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();

    if (user.bot) return;
    if (!reaction.message.guild) return;

    if (reaction.message.channel.id === options.reactRolesChannel) {
      for (const [key, value] of Object.entries(roles)) {
        if (reaction.emoji.name == key) {
          await reaction.message.guild.members.cache
            .get(user.id)
            .roles.remove(value);
        }
      }
    }
  });
};

module.exports.help = {
  name: "reactroles",
};
