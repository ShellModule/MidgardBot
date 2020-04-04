const Discord = require("discord.js");
const auth = require("./auth.json");
const options = require("./options.json");
const fs = require("fs");
const prefix = options.prefix;
const client = new Discord.Client();
client.commands = new Discord.Collection();

fs.readdir("./cmds/", (err, files) => {
  if (err) console.log(err);

  let cmdfiles = files.filter(f => f.split(".").pop() === "js");
  if (cmdfiles.length <= 0) {
    console.log("Brak plików do załadowania!");
    return;
  }

  cmdfiles.forEach((f, i) => {
    let props = require(`./cmds/${f}`);
    console.log(`${i + 1}: ${f} zaladowany!`);
    client.commands.set(props.help.name, props);
  });
});

client.on("ready", () => {
  console.log(`Bot is ready! ${client.user.username} ` + new Date());
  client.user.setActivity("!cmdhelp for help", { type: "PLAYING" });
  client.commands.get("reactroles").run(client, "", "");

  if (options.status) {
    client.commands.get("status_other").run(client, "", "");
  } else {
    console.log("Status on other servers is disabled!");
  }

  if (options.status_ctf) {
    client.commands.get("status_ctf").run(client, "", "");
  } else {
    console.log("Status on ctf servers is disabled!");
  }
});

client.on("guildMemberAdd", guildMember => {
  guildMember
    .addRole(
      guildMember.guild.roles.find(role => role.name === "Midgard Member")
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
      "  **`!invitelink`** - *link to our discord server*\n" +
      "  **`!roles`** - *how to get a role*\n" +
      "  **`!linkfix`** - *if links like this one <soldat://localhost:23073/pass>, won't work*\n" +
      "  **`!status`** - *servers detailed information*\n" +
      "  **`!cmdhelp`** - *to show our commands at any time*\n" +
      // "  **`!msg help`** - *how to send a message to our servers*\n" +
      "\n***MIDGARD SERVERS***\n<#537011480973934592>\n\n" +
      "You can also check <#533697790187012098> for more information"
  );
});

client.on("message", async message => {
  if (message.channel.type === "dm") return;
  const messageArray = message.content.split(" ");
  const command = messageArray[0];
  const args = messageArray.slice(1);

  if (!command.startsWith(prefix)) return;
  if (command === "msgserver") return;
  else if (command === "status_other") return;
  else if (command === "status_ctf") return;
  let cmd = client.commands.get(command.slice(prefix.length));
  if (cmd) cmd.run(client, message, args);
});

client.login(auth.token);
