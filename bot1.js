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
var timeInterval;
var data1;
var data2;
var data3;
var data4;
var data5;
var data6;
var data7;

client.login(auth.token);

client.on("ready", ()=>{
    console.log(`Bot is ready! ${client.user.username}`);

	update();
	clearInterval(timeInterval);
	timeInterval = setInterval(update,60000);
});

async function status(){
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
	.setColor(Math.floor(Math.random() * 16777214) + 1)
	.addField(":flag_gb:**Midgard [CTF] #1**","**Address**: <soldat://51.68.213.93:23081> \n"+(data1[0] > 0 ? ":fire: " : "")+" **Players:**  `" + data1[0] + "/" + data1[1] + "`<:crouch:533700465670619197> **Map:**  `" + data1[2] + "`:map:")
	.addField(":flag_de:**Midgard [CTF] #2**","**Address**: <soldat://138.201.55.232:25660> \n"+(data2[0] > 0 ? ":fire: " : "")+" **Players:**  `" + data2[0] + "/" + data2[1] + "`<:crouch:533700465670619197> **Map:**  `" + data2[2] + "`:map:")
	.addField(":flag_us:**Midgard [Final Bout]**","**Address**: <soldat://162.221.187.210:25020/003> \n"+(data3[0] > 0 ? ":fire: " : "")+" **Players:**  `" + data3[0] + "/" + data3[1] + "`<:crouch:533700465670619197> **Map:**  `" + data3[2] + "`:map:")
	.addField(":flag_us:**Midgard [HTF]**","**Address**: <soldat://162.221.187.210:25000> \n"+(data4[0] > 0 ? ":fire: " : "")+" **Players:**  `" + data4[0] + "/" + data4[1] + "`<:crouch:533700465670619197> **Map:**  `" + data4[2] + "`:map:")
	.addField(":flag_gb:**Midgard [Run Mode]**","**Address**: <soldat://51.68.213.93:23080> \n"+(data5[0] > 0 ? ":fire: " : "")+" **Players:**  `" + data5[0] + "/" + data5[1] + "`<:crouch:533700465670619197> **Map:**  `" + data5[2] + "`:map:")
	.addField(":flag_gb:**Midgard [Climb]**","**Address**: <soldat://51.68.213.93:23082> \n"+(data6[0] > 0 ? ":fire: " : "")+" **Players:**  `" + data6[0] + "/" + data6[1] + "`<:crouch:533700465670619197> **Map:**  `" + data6[2] + "`:map:")
	.addField(":flag_gb:**Midgard [AlphaZRPG]**","**Address**: <soldat://51.68.213.93:23083> \n"+(data7[0] > 0 ? ":fire: " : "")+" **Players:**  `" + data7[0] + "/" + data7[1] + "`<:crouch:533700465670619197> **Map:**  `" + data7[2] + "`:map:")
	.setTimestamp(new Date());
	await client.channels.get(`537011480973934592`).send(embed);
}

async function update(){
	let fetched = await client.channels.get(`537011480973934592`).fetchMessages({limit: 10});
	client.channels.get(`537011480973934592`).bulkDelete(fetched);
	status();
}
