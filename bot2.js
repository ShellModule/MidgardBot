const Discord = require("discord.js");
const snekfetch = require("snekfetch");
const auth = require('./auth.json');
const fs = require("fs");
const prefix = "!";
const client = new Discord.Client();
client.commands = new Discord.Collection();

fs.readdir("./cmds/", (err, files) => {
	if(err) console.log(err);

	let cmdfiles = files.filter(f => f.split(".").pop() === "js");
	if(cmdfiles.length <= 0) {
		console.log("Brak plików do załadowania!");
		return;
	}

	cmdfiles.forEach((f, i) => {
		let props = require(`./cmds/${f}`);
		console.log(`${i + 1}: ${f} zaladowany!`);
		client.commands.set(props.help.name, props);
	})
})

const api = [
   {name: "Midgard [1v1]", ip: "51.68.213.93", port: "23081", flag: ":flag_gb:", skrot: "1v1"},
   {name: "Midgard [CTF]", ip: "138.201.55.232", port: "25660", flag: ":flag_de:", skrot: "ctf"},
   {name: "Midgard [Final Bout]", ip: "162.221.187.210", port: "25020", flag: ":flag_us:", skrot: "finalbout"},
   {name: "Midgard [HTF]", ip: "162.221.187.210", port: "25000", flag: ":flag_us:", skrot: "htf"},
   {name: "Midgard [Run Mode]", ip: "51.68.213.93", port: "23080", flag: ":flag_gb:", skrot: "runmode"},
   {name: "Midgard [Climb]", ip: "51.68.213.93", port: "23082", flag: ":flag_gb:", skrot: "climb"},
   {name: "Midgard [AlphaZRPG]", ip: "51.68.213.93", port: "23083", flag: ":flag_gb:", skrot: "zrpg"}
];
module.exports = {apiExport: api}

const getStatusURL = (ip, port) => `https://api.soldat.pl/v0/server/${ip}/${port}`;
const getPlayersURL = (ip, port) => `https://api.soldat.pl/v0/server/${ip}/${port}/players`;
const channelStatus = `537011480973934592`;

var serversInfo;
var playersInfo;

client.on("ready", ()=>{
  console.log(`Bot is ready! ${client.user.username} ` + new Date());
  client.user.setActivity("!cmdhelp for help", { type: 'PLAYING' });
  update();
  setInterval(update,60000);
});

client.on('guildMemberAdd', (guildMember) => {
	guildMember.addRole(guildMember.guild.roles.find(role => role.name === "Midgard Member"));
});

client.on("message", async message => {
	if(message.channel.type === "dm") return;
  
	const messageArray = message.content.split(" ");
	const command = messageArray[0];
	const args = messageArray.slice(1);
  
	if(!command.startsWith(prefix)) return;
	
	let cmd = client.commands.get(command.slice(prefix.length));
	if(cmd) cmd.run(client, message, args);
});

async function status(){
	
  	let embed = new Discord.RichEmbed()
  	.setAuthor(client.user.username,client.user.avatarURL)
  	.setColor(Math.floor(Math.random() * 16777214) + 1)

  	for (var i in api){
		try {
			serversInfo = await getData(getStatusURL(api[i].ip, api[i].port));
		} catch(e) {
			serversInfo = ["N/A", "N/A", "N/A"];
			console.log(`!!ERROR!! POBIERANIE DANYCH Z LOBBY - ${api[i].name} ` + new Date());
		}
		if(serversInfo[0] != "N/A"){
			serversInfo = [serversInfo.NumPlayers, serversInfo.MaxPlayers, serversInfo.CurrentMap];
			playersInfo = await getData(getPlayersURL(api[i].ip, api[i].port));
		}

	embed.addField(
      	api[i].flag + "**" + api[i].name + "**", 
        "**Address**: " + "<soldat://" + api[i].ip + ":" + api[i].port + ">" + "\n"
      	+ (serversInfo[0] > 0 ? ":fire: " : "") + "**Players:** `" + (serversInfo[0]==="N/A" ? "N/A" : serversInfo[0] + "/" + serversInfo[1]) + "`<:crouch:533700465670619197>"
		+ "**Map:** `" + serversInfo[2] + "`:map:\n" 
		+ (playersInfo.Players.filter(v => {return v != "Zombie"}) != "" ? "```\n" + playersInfo.Players.filter(v => {return v != "Zombie"}).join("  |  ") + "\n```" : "")
    	);
	  }
  	embed.setTimestamp(new Date());
  
	client.channels.get(`${channelStatus}`).send(embed);
}

async function getData(url){
	return await snekfetch.get(url).then(t => {
		return t.body;
	})
}

async function update(){
	let fetched = await client.channels.get(`${channelStatus}`).fetchMessages({limit: 10});
	client.channels.get(`${channelStatus}`).bulkDelete(fetched);
	status();
}

client.login(auth.token);