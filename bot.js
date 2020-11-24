const Discord = require("discord.js");
const auth = require("./auth.json");
const options = require("./options.json");
const fs = require("fs");
const prefix = options.prefix;
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
client.commands = new Discord.Collection();

fs.readdir("./cmds/", (err, files) => {
  if (err) console.log(err);

  let cmdfiles = files.filter((f) => f.split(".").pop() === "js");
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

client.on("ready", async () => {
  console.log(`Bot is ready! ${client.user.username} ` + new Date());
  client.user.setActivity("!cmdhelp for help", { type: "PLAYING" });

  client.commands.get("reactroles").run(client, "", "");
  client.commands.get("newMember").run(client, "", "");

  if (options.status) {
    client.commands.get("status_lobby").run(client, "", "");
  } else {
    console.log("Server status is disabled!");
  }
});

client.on("message", async (message) => {
  if (message.channel.type === "dm") return;
  const messageArray = message.content.split(" ");
  const command = messageArray[0];
  const args = messageArray.slice(1);

  if (!command.startsWith(prefix)) return;
  if (command === "status_lobby") return;
  else if (command === "reactroles") return;
  let cmd = client.commands.get(command.slice(prefix.length));
  if (cmd) cmd.run(client, message, args);
});

client.login(auth.token);
