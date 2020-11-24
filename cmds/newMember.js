const Discord = require("discord.js");

module.exports.run = async (client, message, args) => {
  client.on("guildMemberAdd", (guildMember) => {
    guildMember.roles
      .add(
        guildMember.guild.roles.cache.find(
          (role) => role.name === "Midgard Member"
        )
      )
      .catch(() => {
        console.log(
          'Something went wrong with granting "Midgard Member" role to ' +
            guildMember.nickname
        );
      });
    guildMember.send(
      `Welcome to **Midgard Soldat** <@${guildMember.id}>!\n\n` +
        "__List of available commands on our server:__\n" +
        "  **`!invite`** - *link to our discord server*\n" +
        "  **`!roles`** - *easy way to get multiple roles*\n" +
        "  **`!linkfix`** - *if links like this one <soldat://localhost:23073/pass>, won't work*\n" +
        "  **`!status`** - *servers detailed information*\n" +
        "  **`!cmdhelp`** - *to show our commands at any time*\n" +
        "\n***MIDGARD SERVERS***\n<#537011480973934592>\n\n" +
        "You can also check <#533697790187012098> for more information"
    );
  });
};

module.exports.help = {
  name: "newMember",
};
