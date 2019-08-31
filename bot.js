const Discord = require("discord.js");
const net = require("net");
const auth = require("./auth.json");
const serversData = require("./serversData.json");
const options = require("./options.json");
const fs = require("fs");
const prefix = options.prefix;
const client = new Discord.Client();
const servers = new Array();
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

for (var i in serversData) {
  servers.push(serversData[i].shortName);
}
const types = ["name", "kills", "deaths", "team"];

client.on("ready", () => {
  console.log(`Bot is ready! ${client.user.username} ` + new Date());
  client.user.setActivity("!cmdhelp for help", { type: "PLAYING" });
  client.commands.get("reactroles").run(client, "", "");

  if (options.msgserver) {
    client.commands.get("msgserver").run(client, "", "");
  } else {
    console.log("Messages from server are disabled!");
  }

  if (options.status) {
    startUpdate();
    setInterval(startUpdate, 60000);
  } else {
    console.log("Status is disabled!");
  }
});

client.on("guildMemberAdd", guildMember => {
  guildMember
    .addRole(
      guildMember.guild.roles.find(role => role.name === "Midgard Member")
    )
    .catch(() => {
      console.log('Something went wrong with granting "Midgard Member" role');
    });
  guildMember.send(
    `Welcome to **Midgard Soldat** <@${guildMember.id}>!\n\n` +
      "__List of available commands on our server:__\n" +
      "  **`!invitelink`** - *link to our discord server*\n" +
      "  **`!roles`** - *how to get a role*\n" +
      "  **`!linkfix`** - *if links like this one <soldat://localhost:23073/pass>, doesnt work*\n" +
      "  **`!1v1`** - *1v1 matchmaking*\n" +
      "  **`!status`** - *detailed information on some servers*\n" +
      "  **`!cmdhelp`** - *to show our commands at any time*\n" +
      "  **`!msg help`** - *how to send a message to our servers*\n" +
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
  let cmd = client.commands.get(command.slice(prefix.length));
  if (cmd) cmd.run(client, message, args);
});

function startUpdate() {
  let embed = new Discord.RichEmbed()
    .setAuthor(client.user.username, client.user.avatarURL)
    .setColor(Math.floor(Math.random() * 16777214) + 1);
  getData(embed, 0);
}

async function getData(embed, server) {
  var socket = new net.Socket();
  var dataFromServer = "";
  socket.connect(serversData[servers[server]].port + 10, serversData[servers[server]].ip);

  socket.on("connect", () => {
    socket.write("STARTFILES\r\nlogs/gamestat.txt\r\nENDFILES\r\n");
  });

  socket.on("data", data => {
    dataFromServer += data.toString();
    if (dataFromServer.includes("ENDFILES")) {
      parseData(embed, StrCut(data.toString(), "Players", 0), server);
      socket.destroy();
    }
  });

  socket.on("error", () => {
    console.log(`${serversData[servers[server]].fullName} is unavailable`);
    parseData(embed, "", server);
    socket.destroy();
  });
}

async function parseData(embed, serverInformation, server) {
  var gamestat =
    serverInformation === "" ? "N/A" : new Dane(serverInformation.split("\n"));
  if (gamestat === "N/A") {
    embed.addField(
      serversData[servers[server]].flag + `**${serversData[servers[server]].fullName}**`,
      ":x:**__Server is unavailable!__**:x:"
    );
  } else {
    var players = new Array();
    let Alpha = "";
    let Bravo = "";
    let Spec = "";
    let PlayersCounter = 0;
    let PlayersSorted = sortByKey(gamestat.PlayersInfo, "kills");
    for (var i in PlayersSorted) {
      players.push(PlayersSorted[i].name);
      let toAdd =
        PlayersSorted[i].kills +
        "/" +
        PlayersSorted[i].deaths +
        " " +
        PlayersSorted[i].name +
        "\n";
      if (PlayersSorted[i].team === "1") {
        Alpha = Alpha + toAdd;
      } else if (PlayersSorted[i].team === "2") {
        PlayersCounter++;
        Bravo = Bravo + toAdd;
      } else if (PlayersSorted[i].team === "5") {
        PlayersCounter++;
        Spec = Spec + StrCut(toAdd, " ", 1);
      }
    }
    if (serversData[servers[server]].shortName === "ctf") {
      embed.addField(
        serversData[servers[server]].flag + `**${serversData[servers[server]].fullName}**`,
        "**Address:** " +
          `<soldat://${serversData[servers[server]].ip}:${
            serversData[servers[server]].port
          }>\n` +
          (gamestat.PlayersNum > 0 ? ":fire: " : "") +
          `**Players:** ${gamestat.PlayersNum}/${
            serversData[servers[server]].maxPlayers
          } <:crouch:533700465670619197>` +
          `**Map:** ${gamestat.Map}:map:\n` +
          `**Timeleft:** ${gamestat.Timeleft}:alarm_clock:` +
          `**Score:** ${gamestat.Alpha} : ${gamestat.Bravo}:checkered_flag:`
      );
      if (gamestat.PlayersNum > 0) {
        embed
          .addField(
            "<:redflag:533700464856924181>" + "**Alpha**",
            Alpha != "" ? "```\n" + Alpha + "\n```" : "**`Alpha is empty!`**",
            true
          )
          .addField(
            "<:blueflag:533700465142267905>" + "**Bravo**",
            Bravo != "" ? "```\n" + Bravo + "\n```" : "**`Bravo is empty!`**",
            true
          );
        if (Spec != "") {
          embed.addField(
            ":flag_black:" + "**Spectators**",
            Spec != "" ? "```\n" + Spec + "\n```" : "Spectators are empty!"
          );
        }
      }
    } else if (serversData[servers[server]].shortName === "ls") {
      embed.addField(
        serversData[servers[server]].flag + `**${serversData[servers[server]].fullName}**`,
        "**Address:** " +
          `<soldat://${serversData[servers[server]].ip}:${
            serversData[servers[server]].port
          }>\n` +
          (gamestat.PlayersNum > 0 ? ":fire: " : "") +
          `**Players:** ${PlayersCounter}/${
            serversData[servers[server]].maxPlayers
          } <:crouch:533700465670619197>` +
          `**Map:** ${gamestat.Map}:map:\n`
      );
      if (gamestat.PlayersNum > 0) {
        embed.addField(
          "<:blueflag:533700465142267905>" + "**Survivors**",
          Bravo != "" ? "```\n" + Bravo + "\n```" : "**`No survivors!`**"
        );
        if (Spec != "") {
          embed.addField(
            ":flag_black:" + "**Spectators**",
            Spec != "" ? "```\n" + Spec + "\n```" : "Spectators are empty!"
          );
        }
      }
    } else {
      embed.addField(
        serversData[servers[server]].flag + "**" + serversData[servers[server]].fullName + "**",
        "**Address**: " +
          `<soldat://${serversData[servers[server]].ip}:${
            serversData[servers[server]].port
          }>\n` +
          (gamestat.PlayersNum > 0 ? ":fire: " : "") +
          `**Players:** ${gamestat.PlayersNum}/${
            serversData[servers[server]].maxPlayers
          }<:crouch:533700465670619197> ` +
          `**Map:** ${gamestat.Map}:map:\n` +
          (players.filter(v => {
            return v !== "Zombie";
          }) != ""
            ? "```\n" +
              players
                .filter(v => {
                  return v !== "Zombie";
                })
                .join("  |  ") +
              "\n```"
            : "")
      );
    }
  }
  if (server + 1 < servers.length) getData(embed, server + 1);
  else update(embed);
}

async function update(embed) {
  let fetched = await client.channels
    .get(options.statusChannel)
    .fetchMessages({ limit: 10 });
  client.channels.get(options.statusChannel).bulkDelete(fetched);
  client.channels.get(options.statusChannel).send(embed);
}

function sortByKey(array, key) {
  return array.sort(function(a, b) {
    var x = parseInt(a[key], 10);
    var y = parseInt(b[key], 10);
    return x < y ? 1 : x > y ? -1 : 0;
  });
}

function StrCut(str, deli, offset) {
  let pos = str.indexOf(deli);
  return str.slice(pos + offset, str.length);
}

class Dane {
  constructor(data) {
    this.data = data;
  }

  get PlayersNum() {
    return StrCut(this.data[0], " ", 1);
  }
  get Map() {
    return StrCut(this.data[1], " ", 1);
  }
  get Timeleft() {
    return StrCut(this.data[3], " ", 1);
  }
  get Alpha() {
    return StrCut(this.data[4], " ", 4);
  }
  get Bravo() {
    return StrCut(this.data[5], " ", 4);
  }
  get PlayersInfo() {
    var arr = [];
    var wiersz;
    for (var i in this.data) {
      if (this.data[i] == "Players list: (name/kills/deaths/team/ping)") {
        wiersz = parseInt(i, 10) + 1;
      }
    }
    for (var i = wiersz; i < this.data.length - 2; i = i + 5) {
      let obj = {};
      for (var j = 0; j < 4; j++) {
        obj[types[j]] = this.data[i + j];
      }
      arr.push(obj);
    }
    return arr;
  }
}

client.login(auth.token);