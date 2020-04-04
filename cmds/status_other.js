const Discord = require("discord.js");
const net = require("net");
const serversData = require("../serversData.json");
const options = require("../options.json");
const servers = new Array();

for (var i in serversData) {
  if (serversData[i].shortName.match(/^ctf[1-9]$/g) === null)
    servers.push(serversData[i].shortName);
}

module.exports.run = async (client, message, args) => {
  if (options.status) {
    startUpdate();
    setInterval(startUpdate, 60000);
  } else {
    console.log("Status is disabled!");
  }

  function startUpdate() {
    let embed = new Discord.RichEmbed()
      .setAuthor(client.user.username, client.user.avatarURL)
      .setColor(Math.floor(Math.random() * 16777214) + 1);
    getData(embed, 0);
  }

  function getData(embed, server) {
    var socket = new net.Socket();
    var dataFromServer = "";
    socket.connect(
      serversData[servers[server]].port + 10,
      serversData[servers[server]].ip
    );

    socket.on("connect", () => {
      socket.write("STARTFILES\r\nlogs/gamestat.txt\r\nENDFILES\r\n");
    });

    socket.on("data", data => {
      dataFromServer += data.toString();
      if (dataFromServer.includes("ENDFILES")) {
        parseData(embed, StrCut(data.toString(), "Players", 0), server);
        socket.end();
      }
    });

    socket.on("error", () => {
      parseData(embed, "", server);
      socket.end();
    });
  }

  async function parseData(embed, serverInformation, server) {
    let gamestat =
      serverInformation === ""
        ? "N/A"
        : new Dane(serverInformation.split("\n"));
    if (gamestat === "N/A") {
      embed.addField(
        serversData[servers[server]].flag +
          `**${serversData[servers[server]].fullName}**`,
        ":x:**__Server is unavailable!__**:x:"
      );
    } else {
      if (serversData[servers[server]].shortName === "ls") {
        embed.addField(
          serversData[servers[server]].flag +
            `**${serversData[servers[server]].fullName}**`,
          "**Address:** " +
            `<soldat://${serversData[servers[server]].ip}:${
              serversData[servers[server]].port
            }>\n` +
            (gamestat.PlayersNum > 0 ? ":fire: " : "") +
            "**Players:** " +
            (gamestat.PlayersInfo.bravo.list.length +
              gamestat.PlayersInfo.spectators.list.length) +
            `/${
              serversData[servers[server]].maxPlayers
            } <:crouch:533700465670619197>` +
            `**Map:** ${gamestat.Map}:map:\n`
        );
        if (gamestat.PlayersNum > 0) {
          embed.addField(
            "<:blueflag:533700465142267905>" + "**Survivors**",
            gamestat.PlayersInfo.bravo.string != ""
              ? "```\n" + gamestat.PlayersInfo.bravo.string + "\n```"
              : "**`No survivors!`**"
          );
          if (gamestat.PlayersInfo.spectators.string != "") {
            embed.addField(
              ":flag_black:" + "**Spectators**",
              gamestat.PlayersInfo.spectators.string != ""
                ? "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
                : "Spectators are empty!"
            );
          }
        }
      } else {
        embed.addField(
          serversData[servers[server]].flag +
            "**" +
            serversData[servers[server]].fullName +
            "**",
          "**Address**: " +
            `<soldat://${serversData[servers[server]].ip}:${
              serversData[servers[server]].port
            }>\n` +
            (gamestat.PlayersNum > 0 ? ":fire: " : "") +
            `**Players:** ${gamestat.PlayersNum}/${
              serversData[servers[server]].maxPlayers
            }<:crouch:533700465670619197> ` +
            `**Map:** ${gamestat.Map}:map:\n` +
            (gamestat.PlayersInfo.allPlayers.filter(player => {
              return player.name !== "Zombie";
            }) != ""
              ? "```\n" +
                gamestat.PlayersInfo.allPlayers
                  .filter(player => {
                    return player.name !== "Zombie";
                  })
                  .map(player => player.name)
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
};

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
    this.players = this.Players();
  }

  get PlayersNum() {
    return StrCut(this.data[0], " ", 1);
  }
  get Map() {
    return StrCut(this.data[1], " ", 1);
  }
  get Gamemode() {
    return StrCut(this.data[2], " ", 1);
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
  get Charlie() {
    return StrCut(this.data[6], " ", 4);
  }
  get Delta() {
    return StrCut(this.data[7], " ", 4);
  }
  get PlayersInfo() {
    let playersInfo = {
      allPlayers: new Array(),
      alpha: {
        list: new Array(),
        string: ""
      },
      bravo: {
        list: new Array(),
        string: ""
      },
      charlie: {
        list: new Array(),
        string: ""
      },
      delta: {
        list: new Array(),
        string: ""
      },
      spectators: {
        list: new Array(),
        string: ""
      },
      zero: {
        list: new Array(),
        string: ""
      }
    };
    for (let i in this.players) {
      let player = this.players[i];
      let toAdd = player.kills + "/" + player.deaths + " " + player.name + "\n";
      playersInfo.allPlayers.push(player);
      if (player.team === "1") {
        playersInfo.alpha.list.push(player);
        playersInfo.alpha.string += toAdd;
      } else if (player.team === "2") {
        playersInfo.bravo.list.push(player);
        playersInfo.bravo.string += toAdd;
      } else if (player.team === "3") {
        playersInfo.charlie.list.push(player);
        playersInfo.charlie.string += toAdd;
      } else if (player.team === "4") {
        playersInfo.delta.list.push(player);
        playersInfo.delta.string += toAdd;
      } else if (player.team === "5") {
        playersInfo.spectators.list.push(player);
        playersInfo.spectators.string += toAdd;
      } else if (player.team === "0") {
        playersInfo.zero.list.push(player);
        playersInfo.zero.string += toAdd;
      }
    }
    return playersInfo;
  }

  Players() {
    var playersInfo = [];
    const info = ["name", "kills", "deaths", "team"];
    var row;
    for (var i in this.data) {
      if (this.data[i] == "Players list: (name/kills/deaths/team/ping)") {
        row = parseInt(i, 10) + 1;
      }
    }
    for (var i = row; i < this.data.length - 2; i = i + 5) {
      let player = {};
      for (var j = 0; j < info.length; j++) {
        player[info[j]] = this.data[i + j];
      }
      playersInfo.push(player);
    }
    return sortByKey(playersInfo, "kills");
  }
}

module.exports.help = {
  name: "status_other"
};
