const Discord = require("discord.js");
const snekfetch = require("snekfetch");
const client = new Discord.Client(); 
const prefix = "!";
var auth = require('./auth.json');
var api = [
    "https://api.soldat.pl/v0/server/51.68.213.93/23081",           //CTF#1
    "https://api.soldat.pl/v0/server/138.201.55.232/25660",         //CTF#2
    "https://api.soldat.pl/v0/server/162.221.187.210/25020",        //Final Bout
    "https://api.soldat.pl/v0/server/162.221.187.210/25000",        //HTF
    "https://api.soldat.pl/v0/server/51.68.213.93/23080",           //Run Mode
    "https://api.soldat.pl/v0/server/51.68.213.93/23082",           //Climb
    "https://api.soldat.pl/v0/server/51.68.213.93/23083"            //AlphaZRPG
 ];
var data1;
var data2;
var data3;
var data4;
var data5;
var data6;
var data7;
client.on("ready", async ()=>{
    console.log(`Bot is ready! ${client.user.username}`);

    try {
        let link = await client.generateInvite(["ADMINISTRATOR"]);
        console.log(link);
    } catch(e) {
        console.log(e.stack);
    }
});

client.on("message", async message => {

    if(message.channel.type === "dm") return;

    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return;

	if(command === `${prefix}data`){
		snekfetch.get(api[0]).then(r =>{
			let body = r.body;
			data1=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		}).then(
		snekfetch.get(api[1]).then(r =>{
			let body = r.body;
			data2=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		})).then(
		snekfetch.get(api[2]).then(r =>{
			let body = r.body;
			data3=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		})).then(
		snekfetch.get(api[3]).then(r =>{
			let body = r.body;
			data4=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		})).then(
		snekfetch.get(api[4]).then(r =>{
			let body = r.body;
			data5=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		})).then(
		snekfetch.get(api[5]).then(r =>{
			let body = r.body;
			data6=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		})).then(
		snekfetch.get(api[6]).then(r =>{
			let body = r.body;
			data7=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		}));
	}
	
    if(command === `${prefix}join`){
		var embed;
        await snekfetch.get(api[0]).then(r =>{
			let body = r.body;
			data1=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		}).then(
		await snekfetch.get(api[1]).then(r =>{
			let body = r.body;
			data2=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		})).then(
		await snekfetch.get(api[2]).then(r =>{
			let body = r.body;
			data3=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		})).then(
		await snekfetch.get(api[3]).then(r =>{
			let body = r.body;
			data4=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		})).then(
		await snekfetch.get(api[4]).then(r =>{
			let body = r.body;
			data5=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		})).then(
		await snekfetch.get(api[5]).then(r =>{
			let body = r.body;
			data6=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		})).then(
		await snekfetch.get(api[6]).then(r =>{
			let body = r.body;
			data7=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];  
		}));
		
        embed = new Discord.RichEmbed()
        .setAuthor(client.user.username,client.user.avatarURL)
        .setDescription("<:redflag:533700464856924181>**CLICK TO JOIN** <:blueflag:533700465142267905>")
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .addField("**Midgard [CTF]**",":flag_gb:<soldat://51.68.213.93:23081><:crouch:533700465670619197> Players: " + data1[0] + "/" + data1[1] + "<:zombie:533703686468272128>Map: " + data1[2] + "\n :flag_de:<soldat://138.201.55.232:25660><:crouch:533700465670619197> Players: " + data2[0] + "/" + data2[1] + "<:zombie:533703686468272128>Map: " + data2[2])
        .addField("**Midgard [Final Bout]**",":flag_us:<soldat://162.221.187.210:25020/003><:crouch:533700465670619197> Players: " + data3[0] + "/" + data3[1] + "<:zombie:533703686468272128>Map: " + data3[2])
        .addField("**Midgard [HTF]**",":flag_us:<soldat://162.221.187.210:25000><:crouch:533700465670619197> Players: `" + data4[0] + "/" + data4[1] + "`<:zombie:533703686468272128>Map: " + data4[2])
        .addField("**Midgard [Run Mode]**",":flag_gb:<soldat://51.68.213.93:23080><:crouch:533700465670619197> Players: " + data5[0] + "/" + data5[1] + "<:zombie:533703686468272128>Map: " + data5[2])
        .addField("**Midgard [Climb]**",":flag_gb:<soldat://51.68.213.93:23082><:crouch:533700465670619197> Players: " + data6[0] + "/" + data6[1] + "<:zombie:533703686468272128>Map: " + data6[2])
        .addField("**Midgard [AlphaZRPG]**",":flag_gb:<soldat://51.68.213.93:23083><:crouch:533700465670619197> Players: " + data7[0] + "/" + data7[1] + "<:zombie:533703686468272128>Map: " + data7[2]);
		message.channel.send(embed);
    }
});

client.login(auth.token);
