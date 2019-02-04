const Discord = require("discord.js");
const client = new Discord.Client(); 
var auth = require('./auth.json');
const redflag = client.emojis.find(emoji => emoji.name === "redflag");

client.login(auth.token);

client.on("message", (message) => {
if(message.content == "!join"){
		message.channel.send({embed:{
			color: Math.floor(Math.random() * 16777214) + 1,
			author: {
			name: client.user.username,
			icon_url: client.user.avatarURL
			},
			//title: "     ***__SERVER INFO__***",
			description: "<:redflag:533700464856924181>**CLICK TO JOIN** <:blueflag:533700465142267905>",
			fields: [
			{
				name: "**Midgard [CTF]**",
				value: "<soldat://51.68.213.93:23081><:crouch:533700465670619197>:flag_gb: \n <soldat://138.201.55.232:25660><:crouch:533700465670619197>:flag_de:"
			},
			{
				name: "**Midgard [Final Bout]**",
				value: "<soldat://162.221.187.210:25020/003><:crouch:533700465670619197>:flag_us:"
			},
			{
				name: "**Midgard [HTF]**",
				value: "<soldat://162.221.187.210:25000><:crouch:533700465670619197>:flag_us:"
			},
			{
				name: "**Midgard [Run Mode]**",
				value: "<soldat://51.68.213.93:23080><:crouch:533700465670619197>:flag_gb:"
			},
			{
				name: "**Midgard [Climb]**",
				value: "<soldat://51.68.213.93:23082><:crouch:533700465670619197>:flag_gb:"
			},
			{
				name: "**Midgard [AlphaZRPG]**",
				value: "<soldat://51.68.213.93:23083><:crouch:533700465670619197>:flag_gb:"
			}
			],
			timestamp: new Date(),
			footer: {
				icon_url: client.user.avatarURL,
				text: ""
			}
		}
	});
	}
if(message.content == "!sekret"){
		message.channel.send("***__JEBAC GK :>__***");
	}
});

