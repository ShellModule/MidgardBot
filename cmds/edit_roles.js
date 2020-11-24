const Discord = require("discord.js");

module.exports.run = async (client, message, args) => {
  if (message.author.id != "345625219953721344")
    return message.channel.send("You are not ShellModule");
  client.channels
    .get("570335421461037057")
    .fetchMessage("570335886546305054")
    .then((msg) => {
      msg.edit(
        "**Hello Midgardo**\n" +
          "React to give yourself a role or unreact to remove it:\n\n" +
          ":regional_indicator_c: - Gives you **<@&541951142288949272>**\n" +
          ":regional_indicator_l: - Gives you **<@&566257037617397770>**\n" +
          ":vs: - Gives you **<@&545923070905417729>**\n" +
          ":regional_indicator_m: - Gives you **<@&573150284533071882>**\n" +
          "🏃 - Gives you **<@&633240652951322624>**\n" +
          "<:combat_knife:558336993390493733> - Gives you **<@&657306617230000148>**\n" +
          "🧗‍♂️ - Gives you **<@&744135750857129984>**\n" +
          "🏃‍♀️ - Gives you **<@&744135682917793842>**\n" +
          "<:m79:573199130411794432> - Gives you **<@&755149710162919464>**\n\n" +
          "__You can have multiple roles__"
      );
      // const ayy = client.emojis.find(emoji => emoji.name === "woman_running");
      // msg.react("🏃‍♀️");
      // const ayy2 = client.emojis.find(emoji => emoji.name === "m79");
      // msg.react(ayy2);
    });
};

module.exports.help = {
  name: "secret",
};
