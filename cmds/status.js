const Discord = require("discord.js");
const net = require("net");
const fetch = require("node-fetch");
const serversData = require("../serversData.json");
const servers = [];

const getStatusURL = (ip, port) =>
  `http://api.soldat.pl/v0/server/${ip}/${port}`;

for (var i in serversData) {
  servers.push(serversData[i].shortName);
}

module.exports.run = async (client, message, args) => {
  var sock = new net.Socket();
  if (!args[0]) {
    return message.channel.send(
      "**`!status ctf#`** - **Midgard [CTF]** server. There are 3 servers!\n" +
        "**`!status dm#`** - **Midgard [DM]** server. There are 2 servers!\n" +
        "**`!status tm#`** - **Midgard Teammatch** server. There are 2 servers!\n" +
        "**`!status ls`** - **(WM)Last Stand** server.\n" +
        "**`!status hns`** - **Midgard [HnS]** server.\n" +
        "**`!status ko`** - **Midgard [KO]** server.\n" +
        "**`!status htf`** - **Midgard [HTF]** server.\n" +
        "**`!status runmode`** - **Midgard [Run Mode]** server.\n" +
        "**`!status climb`** - **Midgard [Climb]** server.\n" +
        "**`!status m79c`** - **Midgard [M79 Coop]** server.\n" +
        "**`!status versus`** - **Midgard [1v1]** server.\n" +
        "**`!status os`** - **Midgard [OneShots]** server.\n" +
        "  **#** in command should be replaced by the server number. For example `!msg ctf2`"
    );
  } else if (servers.includes(args[0])) {
    getServerData(args[0]);
  } else {
    return message.channel.send(
      "Invalid command argument. Checkout **!status** and try again."
    );
  }

  async function getServerData(server) {
    var socket = new net.Socket();
    var dataFromServer = "";
    socket.connect(serversData[server].port + 10, serversData[server].ip);

    socket.on("connect", () => {
      socket.write("STARTFILES\r\nlogs/gamestat.txt\r\nENDFILES\r\n");
    });

    socket.setTimeout(2000);

    socket.on("timeout", async () => {
      message.channel.send(
        `Request for **${serversData[server].fullName}** server, has been timed out <:PepeHands:533754872785534999>`
      );
      socket.end();
    });

    socket.on("data", (data) => {
      dataFromServer += data.toString();
      if (dataFromServer.includes("ENDFILES")) {
        parseData(StrCut(data.toString(), "Players", 0), serversData[server]);
        socket.end();
      }
    });

    socket.on("error", () => {
      message.channel.send(
        `**${serversData[server].fullName}** server is unavailable <:PepeHands:533754872785534999>`
      );
      socket.end();
    });
  }

  async function parseData(serverInformation, server) {
    const gamestat = new Dane(serverInformation.split("\n"));
    let lobbyData = await getData(getStatusURL(server.ip, server.port));
    let embed = new Discord.RichEmbed()
      .setColor(Math.floor(Math.random() * 16777214) + 1)
      .setTitle(
        `:flag_${lobbyData.Country.toLowerCase()}:` + `**${lobbyData.Name}**`
      )
      .addField(":map:" + "**Map**", "**`" + lobbyData.CurrentMap + "`**", true)
      .addField(
        ":alarm_clock:" + "**Timeleft**",
        "**`" + gamestat.Timeleft + "`**",
        true
      );

    if (lobbyData === undefined) {
      return message.channel.send(
        `**${serversData[server].fullName}** lobby is unavailable <:PepeHands:533754872785534999>`
      );
    } else {
      if (server.shortName.match(/^ctf[1-3]$/g)) {
        embed = embed_ctf(embed, gamestat, lobbyData);
      } else if (server.shortName.match(/^dm[1-2]$/g)) {
        embed = embed_dm(embed, gamestat, lobbyData);
      } else if (server.shortName === "ls") {
        embed = embed_ls(embed, gamestat, lobbyData);
      } else if (server.shortName === "hns") {
        embed = embed_hns(embed, gamestat, lobbyData);
      } else if (server.shortName === "os") {
        embed = embed_os(embed, gamestat, lobbyData);
      } else if (server.shortName === "runmode") {
        embed = embed_runmode(embed, gamestat, lobbyData);
      } else if (server.shortName === "ko") {
        embed = embed_ko(embed, gamestat, lobbyData);
      } else if (server.shortName === "tm1" || server.shortName === "tm2") {
        embed = embed_tm(embed, gamestat, lobbyData);
      } else if (server.shortName === "htf") {
        embed = embed_ctf(embed, gamestat, lobbyData);
      } else {
        embed = embed_others(embed, gamestat, lobbyData);
      }
      message.channel.send(embed);
    }
  }
};

function embed_ctf(embed, gamestat) {
  embed
    .addField(
      ":checkered_flag:" + "**Score**",
      "**`" + gamestat.Alpha + " : " + gamestat.Bravo + "`**"
    )
    .addField(
      "<:redflag:533700464856924181>" + "**Alpha**",
      gamestat.PlayersInfo.alpha.string != ""
        ? "```\n" + gamestat.PlayersInfo.alpha.string + "\n```"
        : "**`Alpha is empty!`**",
      true
    )
    .addField(
      "<:blueflag:533700465142267905>" + "**Bravo**",
      gamestat.PlayersInfo.bravo.string != ""
        ? "```\n" + gamestat.PlayersInfo.bravo.string + "\n```"
        : "**`Bravo is empty!`**",
      true
    )
    .setTimestamp(new Date());
  if (gamestat.PlayersInfo.spectators.string != "") {
    embed.addField(
      ":flag_black:" + "**Spectators**",
      "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
    );
  }
  if (gamestat.PlayersNum >= 2 && gamestat.KiDe != 0) {
    embed.addField(
      "<:crouch:533700465670619197>**Best K/D ratio**",
      `<:uszanowanko:533764245339373588>` +
        bestKDRatio(gamestat.PlayersInfo.allPlayers).Player
    );
  }
  return embed;
}

function embed_dm(embed, gamestat) {
  embed
    .addField(
      "<:crouch:533700465670619197>" + "**Players**",
      gamestat.PlayersInfo.zero.string !== ""
        ? "```\n" + gamestat.PlayersInfo.zero.string + "\n```"
        : "**`Empty!`**"
    )
    .setTimestamp(new Date());
  if (gamestat.PlayersInfo.spectators.string != "") {
    embed.addField(
      ":flag_black:" + "**Spectators**",
      "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
    );
  }
  return embed;
}

function embed_hns(embed, gamestat) {
  let seekers = "";
  let hiders = "";
  gamestat.PlayersInfo.alpha.list.forEach((seeker) => {
    seekers += seeker.name + "\n";
  });
  gamestat.PlayersInfo.delta.list.forEach((hider) => {
    hiders += hider.name + "\n";
  });
  embed
    .addField(
      "👁️" + "**Seeker**",
      seekers !== "" ? "```\n" + seekers + "\n```" : "**`Empty!`**"
    )
    .addField(
      "<:crouch:533700465670619197>" + "**Hiders**",
      hiders !== "" ? "```\n" + hiders + "\n```" : "**`Empty!`**"
    )
    .setTimestamp(new Date());
  if (gamestat.PlayersInfo.spectators.string != "") {
    embed.addField(
      ":flag_black:" + "**Spectators**",
      "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
    );
  }
  return embed;
}

function embed_os(embed, gamestat) {
  embed
    .addField(
      ":checkered_flag:" + "**Score**",
      "**`" + gamestat.Alpha + " : " + gamestat.Bravo + "`**"
    )
    .addField(
      "<:redflag:533700464856924181>" + "**Alpha**",
      gamestat.PlayersInfo.alpha.string != ""
        ? "```\n" + gamestat.PlayersInfo.alpha.string + "\n```"
        : "**`Alpha is empty!`**",
      true
    )
    .addField(
      "<:blueflag:533700465142267905>" + "**Bravo**",
      gamestat.PlayersInfo.bravo.string != ""
        ? "```\n" + gamestat.PlayersInfo.bravo.string + "\n```"
        : "**`Bravo is empty!`**",
      true
    )
    .setTimestamp(new Date());
  if (gamestat.PlayersInfo.spectators.string != "") {
    embed.addField(
      ":flag_black:" + "**Spectators**",
      "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
    );
  }
  if (gamestat.PlayersNum >= 2 && gamestat.KiDe != 0) {
    embed.addField(
      "<:crouch:533700465670619197>**Deadliest**",
      `<:uszanowanko:533764245339373588>` +
        bestKDRatio(gamestat.PlayersInfo.allPlayers).Player
    );
  }
  return embed;
}

function embed_ls(embed, gamestat) {
  let kills = 0;
  gamestat.PlayersInfo.bravo.list.forEach((player) => {
    kills += +player.kills;
  });
  embed
    .addField(":crossed_swords:**Total kills**", "**`" + kills + "`**")
    .addField(
      "<:blueflag:533700465142267905>" + "**Survivors**",
      gamestat.PlayersInfo.bravo.string != ""
        ? "```\n" + gamestat.PlayersInfo.bravo.string + "\n```"
        : "**`No survivors!`**"
    )
    .setTimestamp(new Date());
  if (gamestat.PlayersInfo.spectators.string != "") {
    embed.addField(
      ":flag_black:" + "**Spectators**",
      "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
    );
  }
  if (
    gamestat.PlayersInfo.bravo.list.length +
      gamestat.PlayersInfo.spectators.list.length >=
      1 &&
    gamestat.KiDe != 0
  ) {
    embed.addField(
      "<:crouch:533700465670619197>**Deadliest**",
      `<:uszanowanko:533764245339373588>` +
        bestKDRatio(gamestat.PlayersInfo.allPlayers).Player
    );
  }
  return embed;
}

function embed_runmode(embed, gamestat) {
  let runners = "";
  gamestat.PlayersInfo.zero.list.forEach((runner) => {
    runners += runner.name + "\n";
  });
  embed
    .addField(
      ":runner:" + "**Runners**",
      runners !== "" ? "```\n" + runners + "\n```" : "**`Empty!`**"
    )
    .setTimestamp(new Date());
  if (gamestat.PlayersInfo.spectators.string != "") {
    embed.addField(
      ":flag_black:" + "**Spectators**",
      "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
    );
  }
  return embed;
}

function embed_ko(embed, gamestat) {
  embed
    .addField(
      ":checkered_flag:" + "**Score**",
      "**`" + gamestat.Alpha + " : " + gamestat.Bravo + "`**"
    )
    .addField(
      "<:redflag:533700464856924181>" + "**Alpha**",
      gamestat.PlayersInfo.alpha.string != ""
        ? "```\n" + gamestat.PlayersInfo.alpha.string + "\n```"
        : "**`Alpha is empty!`**",
      true
    )
    .addField(
      "<:blueflag:533700465142267905>" + "**Bravo**",
      gamestat.PlayersInfo.bravo.string != ""
        ? "```\n" + gamestat.PlayersInfo.bravo.string + "\n```"
        : "**`Bravo is empty!`**",
      true
    )
    .setTimestamp(new Date());
  if (gamestat.PlayersInfo.spectators.string != "") {
    embed.addField(
      ":flag_black:" + "**Spectators**",
      "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
    );
  }
  if (gamestat.PlayersNum >= 2 && gamestat.KiDe != 0) {
    embed.addField(
      "<:crouch:533700465670619197>**Deadliest**",
      `<:uszanowanko:533764245339373588>` + Deadliest.Player
    );
  }
  return embed;
}

function embed_rambo(embed, gamestat) {
  embed
    .addField(
      "🏹" + "**Players**",
      gamestat.PlayersInfo.zero.string != ""
        ? "```\n" + gamestat.PlayersInfo.zero.string + "\n```"
        : "**`Empty!`**",
      true
    )
    .setTimestamp(new Date());
  if (gamestat.PlayersInfo.spectators.string != "") {
    embed.addField(
      ":flag_black:" + "**Spectators**",
      "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
    );
  }
  return embed;
}

function embed_tm(embed, gamestat) {
  embed
    .addField(
      "🏁**Score**",
      `🔴 ${gamestat.Alpha}\n` +
        `🔵 ${gamestat.Bravo}\n` +
        `🟡 ${gamestat.Charlie}\n` +
        `🟢 ${gamestat.Delta}\n`
    )
    .addField(
      "🟥 **Alpha**",
      gamestat.PlayersInfo.alpha.string != ""
        ? "```\n" + gamestat.PlayersInfo.alpha.string + "\n```"
        : "**`Alpha is empty!`**",
      true
    )
    .addField(
      "🟦 **Bravo**",
      gamestat.PlayersInfo.bravo.string != ""
        ? "```\n" + gamestat.PlayersInfo.bravo.string + "\n```"
        : "**`Bravo is empty!`**",
      true
    )
    .addField("\u200b", "\u200b")
    .addField(
      "🟨 **Charlie**",
      gamestat.PlayersInfo.charlie.string != ""
        ? "```\n" + gamestat.PlayersInfo.charlie.string + "\n```"
        : "**`Charlie is empty!`**",
      true
    )
    .addField(
      "🟩 **Delta**",
      gamestat.PlayersInfo.delta.string != ""
        ? "```\n" + gamestat.PlayersInfo.delta.string + "\n```"
        : "**`Delta is empty!`**",
      true
    )
    .setTimestamp(new Date());
  if (gamestat.PlayersInfo.spectators.string != "") {
    embed.addField(
      ":flag_black:" + "**Spectators**",
      "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
    );
  }
  if (gamestat.PlayersNum >= 2 && gamestat.KiDe != 0) {
    embed.addField(
      "<:crouch:533700465670619197>**Best K/D ratio**",
      `<:uszanowanko:533764245339373588>` +
        bestKDRatio(gamestat.PlayersInfo.allPlayers).Player
    );
  }
  return embed;
}

function embed_others(embed, gamestat) {
  let players = "";
  gamestat.PlayersInfo.allPlayers.forEach((player) => {
    players += player.name + "\n";
  });

  embed
    .addField(
      "<:crouch:533700465670619197>" + "**Players**",
      players != "" ? "```\n" + players + "\n```" : "**`Empty!`**"
    )
    .setTimestamp(new Date());
  if (gamestat.PlayersInfo.spectators.string != "") {
    embed.addField(
      ":flag_black:" + "**Spectators**",
      "```\n" + gamestat.PlayersInfo.spectators.string + "\n```"
    );
  }
  return embed;
}

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = parseInt(a[key], 10);
    var y = parseInt(b[key], 10);
    return x < y ? 1 : x > y ? -1 : 0;
  });
}

function bestKDRatio(array) {
  var best = { KiDe: 0, Player: "" };
  var temp = 0;
  for (var i in array) {
    temp = parseInt(array[i].kills, 10);
    if (temp > best.KiDe) {
      best.KiDe = temp;
      best.Player = array[i].name;
    }
  }
  return best;
}

function StrCut(str, deli, offset) {
  let pos = str.indexOf(deli);
  return str.slice(pos + offset, str.length);
}

async function getData(url) {
  return fetch(url)
    .then((res) => res.json())
    .then((body) => body);
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
        string: "",
      },
      bravo: {
        list: new Array(),
        string: "",
      },
      charlie: {
        list: new Array(),
        string: "",
      },
      delta: {
        list: new Array(),
        string: "",
      },
      spectators: {
        list: new Array(),
        string: "",
      },
      zero: {
        list: new Array(),
        string: "",
      },
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
  name: "status",
};
