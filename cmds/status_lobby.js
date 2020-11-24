const Discord = require("discord.js");
const fetch = require("node-fetch");
const serversData = require("../serversData.json");
const options = require("../options.json");
const servers = [];

const getStatusURL = (ip, port) =>
  `http://api.soldat.pl/v0/server/${ip}/${port}`;
const getPlayersURL = (ip, port) =>
  `http://api.soldat.pl/v0/server/${ip}/${port}/players`;
const lobbyStatus = [];
for (var i in serversData) {
  servers.push(serversData[i].shortName);
}

module.exports.run = async (client, message, args) => {
  if (options.status) {
    initialEmbed();
    console.log("Other servers status online.");
    setInterval(initialEmbed, 60000);
  } else {
    console.log("Status is disabled!");
  }

  function initialEmbed() {
    let embed = new Discord.MessageEmbed()
      .setAuthor(client.user.username, client.user.avatarURL)
      .setColor(Math.floor(Math.random() * 16777214) + 1);
    getLobbyData(embed);
  }

  async function getLobbyData(embed) {
    servers
      .reduce((promiseChain, server) => {
        return promiseChain.then(
          () =>
            new Promise((resolve) => {
              asyncFunction(server, resolve);
            })
        );
      }, Promise.resolve())
      .then(() => parseData(embed, lobbyStatus));
  }

  function asyncFunction(server, callback) {
    setTimeout(async () => {
      let lobby = await getData(
        getStatusURL(serversData[server].ip, serversData[server].port)
      );
      lobbyStatus[serversData[server].shortName] = lobby;
      callback();
    }, 20);
  }

  async function getData(url) {
    return fetch(url)
      .then((res) => res.json())
      .then((body) => body);
  }

  async function parseData(embed, lobbyStatus) {
    // embed.addField(
    //   serversData[servers[server]].flag +
    //     `**${serversData[servers[server]].fullName}**`,
    //   ":x:**__Server is unavailable!__**:x:"
    // );
    try {
      for (lobby in lobbyStatus) {
        if (lobbyStatus[lobby].error !== undefined) {
          embed.addField(
            `**${lobby.toUpperCase()}**`,
            ":x:**__Server is unavailable!__**:x:"
          );
        } else {
          let playersInfo =
            lobbyStatus[lobby].NumPlayers > 0
              ? await getData(
                  getPlayersURL(lobbyStatus[lobby].IP, lobbyStatus[lobby].Port)
                )
              : "";
          embed.addField(
            `:flag_${lobbyStatus[lobby].Country.toLowerCase()}:` +
              "**" +
              lobbyStatus[lobby].Name +
              "**",
            "**Address**: " +
              `<soldat://${lobbyStatus[lobby].IP}:${lobbyStatus[lobby].Port}>\n` +
              (lobbyStatus[lobby].NumPlayers > 0 ? ":fire: " : "") +
              `**Players:** ${lobbyStatus[lobby].NumPlayers}/${lobbyStatus[lobby].MaxPlayers}<:crouch:533700465670619197> ` +
              `**Map:** ${lobbyStatus[lobby].CurrentMap}:map:\n` +
              (lobbyStatus[lobby].NumPlayers === 0
                ? ""
                : "```\n" +
                  playersInfo.Players.join(`${options.delimeter}`) +
                  "\n```")
          );
        }
      }
    } catch (err) {
      console.log("ERROR in for loop");
    }

    update(embed);
  }

  async function update(embed) {
    let fetched = await client.channels.cache
      .get(options.statusChannel)
      .messages.fetch();
    fetched.forEach((msg) => {
      msg.delete();
    });
    client.channels.cache.get(options.statusChannel).send(embed);
  }
};

module.exports.help = {
  name: "status_lobby",
};
