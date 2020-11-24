const Discord = require("discord.js");
const auth = require("./auth.json");
const options = require("./options.json");
const fs = require("fs");
const prefix = options.prefix;
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
client.commands = new Discord.Collection();

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
  // client.commands.get("reactroles").run(client, "", "");

  if (options.status) {
    client.commands.get("status_lobby").run(client, "", "");
  } else {
    console.log("Status on other servers is disabled!");
  }

  // let channel = await client.channels.cache.find(
  //   (ch) => ch.id == "570335421461037057"
  // );

  // // You can set any limit you want, for performance I used a low number
  // channel.messages
  //   .fetch({ limit: 10 })
  //   .then(async (messages) => {
  //     messages.forEach(async (message) => {
  //       if (message.partial) await message.fetch();
  //       if (!message.guild) return;
  //       message.guild.members.fetch().then(console.log);
  //       for (let reactionObj of message.reactions.cache) {
  //         for (let reaction of reactionObj) {
  //           if (typeof reaction == "string") continue;
  //           if (Object.keys(roles).includes(reaction.emoji.identifier))
  //             continue;
  //           reaction.users.fetch().then(async (users) => {
  //             users.forEach(async (user) => {
  //               try {
  //                 let mem = await reaction.message.guild.members.fetch(user.id);
  //                 console.log(mem.user.roles.has("545923070905417729"));
  //               } catch (err) {}
  //             });
  //           });
  //         }
  //       }
  //     });
  //     console.log("XD");
  //   })
  //   .catch(console.error);
});

client.on("guildMemberAdd", (guildMember) => {
  console.log("HALO");
  guildMember
    .addRole(
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

client.on("guildMemberRemove", (guildMember) => {
  console.log(guildMember.nickname + " left");
});

client.on("message", async (message) => {
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

client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  if (user.bot) return;
  if (!reaction.message.guild) return;
  console.log(user);
  if (reaction.message.channel.id === "570335421461037057") {
    for (const [key, value] of Object.entries(roles)) {
      console.log(reaction.emoji.name + " || " + key);
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
  console.log(user);
  if (reaction.message.channel.id === "570335421461037057") {
    for (const [key, value] of Object.entries(roles)) {
      if (reaction.emoji.name == key) {
        await reaction.message.guild.members.cache
          .get(user.id)
          .roles.remove(value);
      }
    }
  }
});

client.login(auth.token);
