const Discord = require("discord.js");
const snekfetch = require("snekfetch");
const auth = require('./auth.json');

const prefix = "!";
const api = [
   {name: "Midgard [1v1]", ip: "51.68.213.93", port: "23081", flag: ":flag_gb:"},
   {name: "Midgard [CTF]", ip: "138.201.55.232", port: "25660", flag: ":flag_de:"},
   {name: "Midgard [Final Bout]", ip: "162.221.187.210", port: "25020", flag: ":flag_us:"},
   {name: "Midgard [HTF]", ip: "162.221.187.210", port: "25000", flag: ":flag_us:"},
   {name: "Midgard [Run Mode]", ip: "51.68.213.93", port: "23080", flag: ":flag_gb:"},
   {name: "Midgard [Climb]", ip: "51.68.213.93", port: "23082", flag: ":flag_gb:"},
   {name: "Midgard [AlphaZRPG]", ip: "51.68.213.93", port: "23083", flag: ":flag_gb:"}
];
const getApiURL = (ip, port) => `https://api.soldat.pl/v0/server/${ip}/${port}`;

const client = new Discord.Client(); 
var data;
client.login(auth.token);

client.on("ready", ()=>{
  console.log(`Bot is ready! ${client.user.username}`);
  update();
  setInterval(update,60000);
});

async function status(){
    
  let embed = new Discord.RichEmbed()
  .setAuthor(client.user.username,client.user.avatarURL)
  .setColor(Math.floor(Math.random() * 16777214) + 1)

  for (var i in api){
    await snekfetch.get(getApiURL(api[i].ip, api[i].port)).then(t => {
      let body = t.body;
      data=[body.NumPlayers, body.MaxPlayers, body.CurrentMap];
    }).catch(err => 
      (data=["N/A","N/A","N/A"], 
      console.log(err), 
      console.log("PROBLEM PODCZAS POBIERANIA DANYCH Z LOBBY")));

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

async function update(){
	let fetched = await client.channels.get(`537011480973934592`).fetchMessages({limit: 10});
	client.channels.get(`537011480973934592`).bulkDelete(fetched);
	status();
}