const Discord = require("discord.js");
const snekfetch = require("snekfetch");
const auth = require('./auth.json');
const file = require("fs");

const prefix = "!";
const api = [
   {name: "Midgard [1v1]", ip: "51.68.213.93", port: "23081", flag: ":flag_gb:", skrot: "1v1"},
   {name: "Midgard [CTF]", ip: "138.201.55.232", port: "25660", flag: ":flag_de:", skrot: "ctf"},
   {name: "Midgard [Final Bout]", ip: "162.221.187.210", port: "25020", flag: ":flag_us:", skrot: "finalbout"},
   {name: "Midgard [HTF]", ip: "162.221.187.210", port: "25000", flag: ":flag_us:", skrot: "htf"},
   {name: "Midgard [Run Mode]", ip: "51.68.213.93", port: "23080", flag: ":flag_gb:", skrot: "runmode"},
   {name: "Midgard [Climb]", ip: "51.68.213.93", port: "23082", flag: ":flag_gb:", skrot: "climb"},
   {name: "Midgard [AlphaZRPG]", ip: "51.8.213.93", port: "23083", flag: ":flag_gb:", skrot: "zrpg"}
];
const getStatusURL = (ip, port) => `https://api.soldat.pl/v0/server/${ip}/${port}`;
const getPlayersURL = (ip, port) => `https://api.soldat.pl/v0/server/${ip}/${port}/players`;

const client = new Discord.Client(); 
var data;
var body;
client.login(auth.token);

client.on("ready", ()=>{
  console.log(`Bot is ready! ${client.user.username}`);
  update();
  setInterval(update,60000);
});

client.on("message", async message => {
	if(message.channel.type === "dm") return;
  
	const messageArray = message.content.split(" ");
	const command = messageArray[0];
	const args = messageArray.slice(1);
  
	if(!command.startsWith(prefix)) return;
	
	if(command === `${prefix}players`){
		if(!args[0]) {
			message.channel.send("Type **`!players help`** <:uszanowanko:533764245339373588>");
			return;
		}
		if(args[0] === "help") {
			let toSend = "**__List of players on the server__**: \n";
			for(var i=0;i<6;i++){
			toSend = toSend + `${api[i].flag} ${api[i].name}` + " - " + "**` !players " + `${api[i].skrot}` + "`**\n";
			}
			message.channel.send(toSend);
			return;
		}
		for(var i=0;i<6;i++){
			if(args[0].toLowerCase() === api[i].skrot) {
				await getData(getPlayersURL(api[i].ip, api[i].port)).then(() => {
					let embed = new Discord.RichEmbed()
					.setTitle(api[i].flag + " " + api[i].name)
					.setColor(Math.floor(Math.random() * 16777214) + 1)
					.addField("<:zombie:533703686468272128> Players <:crouch:533700465670619197>", (body.Players != "" ? body.Players : "Server is empty"))
					message.channel.send(embed);
				}).catch(err => {
					message.channel.send(`**Lobby of server __${api[i].name}__ is unavailable**`);
				})
				return;
			}
		}
		message.channel.send("Type **`!players help`** <:uszanowanko:533764245339373588>");
	}
  });

async function status(){
	
  	let embed = new Discord.RichEmbed()
  	.setAuthor(client.user.username,client.user.avatarURL)
  	.setColor(Math.floor(Math.random() * 16777214) + 1)

  	for (var i in api){
		await getData(getStatusURL(api[i].ip, api[i].port)).then(() => {
      		data=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];
		}).catch(err => 
			(data=["N/A","N/A","N/A"], 
			console.log(`!!ERROR!! POBIERANIE DANYCH Z LOBBY - ${api[i].name} ` + new Date())));

	embed.addField(
      	api[i].flag + "**" + api[i].name + "**", 
        "**Address**: " + "<soldat://" + api[i].ip + ":" + api[i].port + ">" + "\n"
      	+ (data[0] > 0 ? ":fire: " : "") + "**Players:** `" + (data[0]==="N/A" ? "N/A" : data[0] + "/" + data[1]) + "`<:crouch:533700465670619197>"
      	+ "**Map:** `" + data[2] + "`:map:"
    	);
  	}
  	embed.setTimestamp(new Date());
  
	client.channels.get(`537011480973934592`).send(embed);
}

async function getData(url){
	await snekfetch.get(url).then(t => {
		body = t.body;
	})
}

async function update(){
	let fetched = await client.channels.get(`537011480973934592`).fetchMessages({limit: 10});
	client.channels.get(`537011480973934592`).bulkDelete(fetched);
	status();
}