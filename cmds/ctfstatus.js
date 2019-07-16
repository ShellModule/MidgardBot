const Discord = require("discord.js");
const net = require("net");
const api = require("../passwords.json");
const options = require("../options.json");
const types = ["name", "kills", "deaths", "team"];

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

module.exports.run = async (client, message, args) => {
  var sock = new net.Socket();
  if (!args[0]) {
    return message.channel.send(
      "**`!status ctf`** - *detailed information on a **Midgard [CTF]** server*\n" +
        "**`!status os`** - *detailed information on a **Midgard [OneShots]** server*\n" +
        "**`!status ls`** - *detailed information on a **(WM)Last Stand** server*\n" +
        "**`!status 1v1`** - *detailed information on a **private 1v1** server*\n"
    );
  } else if (args[0] === "ctf") {
    sock.connect(api.ctf.port + 10, api.ctf.ip);
  } else if (args[0] === "ls") {
    sock.connect(api.ls.port + 10, api.ls.ip);
  } else if (args[0] === "os") {
    sock.connect(api.os.port + 10, api.os.ip);
  } else if (args[0] === "1v1") {
    sock.connect(options.private1v1.port + 10, options.private1v1.ip);
  } else {
    return message.channel.send("Try **`!status`**");
  }
  sock.on("connect", async () => {
    sock.write("STARTFILES\r\nlogs/gamestat.txt\r\nENDFILES\r\n");
  });

  sock.on("data", data => {
    if (data.length > 12) {
      var temp = StrCut(data.toString(), "Players", 0);
      main(temp.split("\n"), message, args);
    }
    if (data.toString().includes("ENDFILES")) {
      sock.destroy();
    }
  });

  sock.on("error", () => {
    message.channel.send(
      "**Midgard [CTF]** is unavailable <:PepeHands:533754872785534999>"
    );
    sock.destroy();
  });

  sock.on("end", () => {
    if (sock.bytesRead == 0) {
      message.channel.send(
        "**Midgard [CTF]** is unavailable <:PepeHands:533754872785534999>"
      );
    }
  });
};

function main(data, message, args) {
  const gamestat = new Dane(data);

  var embed = new Discord.RichEmbed();
  var Alpha = "";
  var Bravo = "";
  var priv1v1 = new Array();
  var Spec = "";
  var PlayerCounter = 0;
  var totalKills = 0;
  var PlayersSorted = sortByKey(gamestat.PlayersInfo, "kills");
  for (var i in PlayersSorted) {
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
      totalKills += parseInt(PlayersSorted[i].kills, 10);
      PlayerCounter++;
      Bravo = Bravo + toAdd;
    } else if (PlayersSorted[i].team === "5") {
      PlayerCounter++;
      Spec = Spec + StrCut(toAdd, " ", 1);
    } else if (PlayersSorted[i].team === "0") {
      PlayerCounter++;
      totalKills += parseInt(PlayersSorted[i].kills, 10);
      priv1v1.push(PlayersSorted[i]);
    }
  }
  var Deadliest = bestKDRatio(gamestat.PlayersInfo);
  if (args[0] == "ctf") {
    embed
      .setColor(Math.floor(Math.random() * 16777214) + 1)
      .setTitle(`${api.ctf.flag}` + `**${api.ctf.name2}**`)
      .addField(":map:" + "**Map**", "**`" + gamestat.Map + "`**", true)
      .addField(
        ":alarm_clock:" + "**Timeleft**",
        "**`" + gamestat.Timeleft + "`**",
        true
      );
    embed
      .addField(
        ":checkered_flag:" + "**Score**",
        "**`" + gamestat.Alpha + " : " + gamestat.Bravo + "`**"
      )
      .addField(
        "<:redflag:533700464856924181>" + "**Alpha**",
        Alpha != "" ? "```\n" + Alpha + "\n```" : "**`Alpha is empty!`**",
        true
      )
      .addField(
        "<:blueflag:533700465142267905>" + "**Bravo**",
        Bravo != "" ? "```\n" + Bravo + "\n```" : "**`Bravo is empty!`**",
        true
      )
      .setTimestamp(new Date());
    if (Spec != "") {
      embed.addField(
        ":flag_black:" + "**Spectators**",
        Spec != "" ? "```\n" + Spec + "\n```" : "Spectators are empty!"
      );
    }
    if (gamestat.PlayersNum >= 2 && gamestat.KiDe != 0) {
      embed.addField(
        "<:crouch:533700465670619197>**Deadliest**",
        `<:uszanowanko:533764245339373588>` + Deadliest.Player
      );
    }
  } else if (args[0] == "os") {
    embed
      .setColor(Math.floor(Math.random() * 16777214) + 1)
      .setTitle(`${api.os.flag}` + `**${api.os.name2}**`)
      .addField(":map:" + "**Map**", "**`" + gamestat.Map + "`**", true)
      .addField(
        ":alarm_clock:" + "**Timeleft**",
        "**`" + gamestat.Timeleft + "`**",
        true
      );
    embed
      .addField(
        ":checkered_flag:" + "**Score**",
        "**`" + gamestat.Alpha + " : " + gamestat.Bravo + "`**"
      )
      .addField(
        "<:redflag:533700464856924181>" + "**Alpha**",
        Alpha != "" ? "```\n" + Alpha + "\n```" : "**`Alpha is empty!`**",
        true
      )
      .addField(
        "<:blueflag:533700465142267905>" + "**Bravo**",
        Bravo != "" ? "```\n" + Bravo + "\n```" : "**`Bravo is empty!`**",
        true
      )
      .setTimestamp(new Date());
    if (Spec != "") {
      embed.addField(
        ":flag_black:" + "**Spectators**",
        Spec != "" ? "```\n" + Spec + "\n```" : "Spectators are empty!"
      );
    }
    if (gamestat.PlayersNum >= 2 && gamestat.KiDe != 0) {
      embed.addField(
        "<:crouch:533700465670619197>**Deadliest**",
        `<:uszanowanko:533764245339373588>` + Deadliest.Player
      );
    }
  } else if (args[0] == "ls") {
    embed
      .setColor(Math.floor(Math.random() * 16777214) + 1)
      .setTitle(`${api.ls.flag}` + `**${api.ls.name2}**`)
      .addField(":map:" + "**Map**", "**`" + gamestat.Map + "`**", true)
      .addField(
        ":alarm_clock:" + "**Timeleft**",
        "**`" + gamestat.Timeleft + "`**",
        true
      )
      .addField(":crossed_swords:**Total kills**", "**`" + totalKills + "`**")
      .addField(
        "<:blueflag:533700465142267905>" + "**Survivors**",
        Bravo != "" ? "```\n" + Bravo + "\n```" : "**`No survivors!`**",
        true
      )
      .setTimestamp(new Date());
    if (Spec != "") {
      embed.addField(
        ":flag_black:" + "**Spectators**",
        Spec != "" ? "```\n" + Spec + "\n```" : "Spectators are empty!"
      );
    }
    if (PlayerCounter >= 1 && gamestat.KiDe != 0) {
      embed.addField(
        "<:crouch:533700465670619197>**Deadliest**",
        `<:uszanowanko:533764245339373588>` + Deadliest.Player
      );
    }
  } else if (args[0] == "1v1") {
    embed
      .setColor(Math.floor(Math.random() * 16777214) + 1)
      .setTitle(`${options.private1v1.flag}` + `**${options.private1v1.name}**`)
      .addField(":map:" + "**Map**", "**`" + gamestat.Map + "`**")
      .addField(
        ":alarm_clock:" + "**Timeleft**",
        "**`" + gamestat.Timeleft + "`**"
      )
      .addField(
        "<:m79:573199130411794432>" + "**1st player**",
        priv1v1[0] != null
          ? "```\n" +
              priv1v1[0].name +
              "```\n" +
              ":skull_crossbones:**Kills:** " +
              priv1v1[0].kills
          : "**`EMPTY`**",
        true
      )
      .addField(
        "<:combat_knife:558336993390493733>" + "**2nd player**",
        priv1v1[1] != null
          ? "```\n" +
              priv1v1[1].name +
              "```\n" +
              ":skull_crossbones:**Kills:** " +
              priv1v1[1].kills
          : "**`EMPTY`**",
        true
      )
      .setTimestamp(new Date());
  }
  message.channel.send(embed);
}

function sortByKey(array, key) {
  return array.sort(function(a, b) {
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
module.exports.help = {
  name: "status"
};
