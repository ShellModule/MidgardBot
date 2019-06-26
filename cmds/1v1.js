const Discord = require("discord.js");
const snekfetch = require("snekfetch");
const fs = require("fs");
const options = require("../options.json");
const net = require("net");
const PORT = 23074;
const IP = "51.75.74.225";
const serverAddress = `soldat://${IP}:${PORT}`;
const serverURL = `https://api.soldat.pl/v0/server/${IP}/${PORT}`;
const gameTime = 2400000;
const timeToTick = 180000;
var queue = [":bust_in_silhouette:", ":bust_in_silhouette:"];
var players = [];
var fOs = 0;
var checkInt;
var kickInt;
var timeInt;
var timeToDisplay = (gameTime/1000)/60;
var game = false;
var display = false;

module.exports.run = async (client, message, args) => {
  var PLAYER = message.member;
  if (args[0] === "add") {
    if (!warr(message)) return;
    try {
      var ServerInfo = await getData(serverURL);
    } catch (e) {
      console.log(e);
      return message.channel.send("Cannot connect to the server!");
    }
    if (ServerInfo.NumPlayers > 0) {
      return message.channel.send("Someone is already playing on the server!");
    }
    if (PLAYER.presence.status !== "online") {
      return message.channel.send(
        "You must be **Online** to use this command!"
      );
    }
    if (players[0] === PLAYER.id) {
      message.channel.send(
        "You cannot duel yourself! <:PepeHands:533754872785534999>"
      );
      return;
    }

    timeToDisplay = (gameTime/1000)/60;
    clearInterval(timeInt);
    clearTimeout(kickInt);
    players.push(PLAYER.id);
    if (fOs !== 1) {
      checkInt = setInterval(() => {
        check(client, message);
      }, 1000);
    }
    queue[fOs] = `<@${players[fOs]}>`;
    let embed = new Discord.RichEmbed()
      .setColor(Math.floor(Math.random() * 16777214) + 1)
      .setTitle(":vs: 1v1 match")
      .setDescription(`[${queue[0]}, ${queue[1]}]`);
    message.channel.send(embed);

    if (fOs === 1) {
      clearInterval(checkInt);
      queue = shuffle(queue);
      let socket = new net.Socket();
      let newPassword = makeid(4);
      await socket.connect(PORT, IP);
      socket.on("connect", () => {
        socket.write(options.vsPassword + "\r\n");
        if (!display) {
          socket.write(`/password ${newPassword}\r\n`);
          if (game) {
            clearTimeout(kickInt);
            socket.write(`/kick 1\r\n`);
            socket.write(`/kick 2\r\n`);
            game = false;
          }
        } else {
          display = false;
          socket.write(`/say ${timeToDisplay} min remaining\r\n`);
        }
        setTimeout(() => socket.destroy(), 2000);
      });

      let embed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setTitle(":vs: 1v1 match between:")
        .addField("**1# Player**", `${queue[0]}`, true)
        .addField("**2# Player**", `${queue[1]}`, true)
        .setFooter("Please check your PMs for server information");
      message.channel.send(embed);

      for (var i in players) {
        let embed = new Discord.RichEmbed()
          .setColor(Math.floor(Math.random() * 16777214) + 1)
          .setTitle(":vs: 1v1 match")
          .addField(
            "**Server info**",
            `<${serverAddress}` + `/${newPassword}>`,
            true
          )
          .addField("**1# Player**", `${queue[0]}`)
          .addField("**2# Player**", `${queue[1]}`);
        client.users.get(players[i]).send(embed);
      }

      queue = [":bust_in_silhouette:", ":bust_in_silhouette:"];
      fOs = 0;
      players = [];
      timeInt = setInterval(async () => {
        timeToDisplay = timeToDisplay - 1;
        console.log(timeToDisplay);
        display = true;
        await socket.connect(PORT, IP);
      }, timeToTick);
      kickInt = setTimeout(async () => {
        clearInterval(timeInt);
        game = true;
        newPassword = makeid(4);
        await socket.connect(PORT, IP);
      }, gameTime);
    } else fOs++;
    return;
  }
  if (args[0] === "del") {
    if (!warr(message)) return;
    if (players.length === 1) {
      clearInterval(checkInt);
      if (players[0] !== PLAYER.id)
        return message.channel.send("You are not in the queue!");
      queue = [":bust_in_silhouette:", ":bust_in_silhouette:"];
      players.pop();
      let embed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setTitle(":vs: 1v1 match")
        .setDescription(`[${queue[0]}, ${queue[1]}]`);
      message.channel.send(embed);
      fOs = 0;
    } else {
      return message.channel.send("You are not in the queue!");
    }
    return;
  }
  if (args[0] === "status") {
    if (!warr(message)) return;
    let embed = new Discord.RichEmbed()
      .setColor(Math.floor(Math.random() * 16777214) + 1)
      .setTitle(":vs: 1v1 match")
      .setDescription(`[${queue[0]}, ${queue[1]}]`);
    message.channel.send(embed);
    return;
  }

  message.channel.send(
    "These commands can only be used in <#546699178760208431> channel\n" +
      "`!1v1 add` - to enter queue\n" +
      "`!1v1 del` - to leave queue\n" +
      "`!1v1 status` - to show current queue\n" +
      "_Please note, any user who will change his **status**, will be deleted from the queue automatically._"
  );
};

module.exports.help = {
  name: "1v1"
};

function check(client, message) {
  if (players.length === 1) {
    let status = client.users.get(players[0]).presence.status;
    if (status !== "online") {
      clearInterval(checkInt);
      message.channel.send(
        `Player ${queue[0]} went **${status}** and was removed from the queue`
      );
      queue = [":bust_in_silhouette:", ":bust_in_silhouette:"];
      players.pop();
      let embed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setTitle(":vs: 1v1 match")
        .setDescription(`[${queue[0]}, ${queue[1]}]`);
      message.channel.send(embed);
      fOs = 0;
    }
  }
}

function warr(message) {
  if (message.channel.id !== options.versusChannel) {
    message.channel.send(
      `This command can only be used in <#${options.versusChannel}> channel`
    );
    return 0;
  } else return 1;
}

function shuffle(array) {
  var currentIndex = array.length;
  var temporaryValue;
  var randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

async function getRandomLine(filename) {
  let data = fs.readFileSync(filename, "utf8");
  var lines = data.toString().split("\n");
  return lines[Math.floor(Math.random() * lines.length)];
}

async function getData(url) {
  return snekfetch.get(url).then(t => {
    return t.body;
  });
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
