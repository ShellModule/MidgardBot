const Discord = require("discord.js");

module.exports.run = async (client, message, args) => {
    let embed = new Discord.RichEmbed()
    .setAuthor("Savage", client.users.get(`237702365707370506`).avatarURL)
    .setDescription("If your Soldat client doesn't launch when you click on links like <soldat://localhost:23073/pass>, try the next steps:\n" + 
    "1. Download soldat_uri.vbs here: <https://goo.gl/yb4uPY>.\n" + 
    "2. Run the file. It'll now ask for Admin Permissions, this process needs it.\n" + 
    "3. You'll now be asked to browse to your Soldat directory (i.e C:\\Soldat).\n" + 
    "4. You'll now be asked if you want to run a specific modification.\n" + 
    "5. If you do, click Yes. An input box will pop so you can type the mod's name.\n")
    .setTimestamp("02/15/2019");
    message.channel.send(embed);
}

module.exports.help = {
    name: "linkfix"
}