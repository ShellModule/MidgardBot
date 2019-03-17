const Discord = require("discord.js");
const roles = ["CTF Player", "1v1 Player", "Climb/RunMode Player"];
const rolesCMD = ["ctf", "1v1", "climb/runmode"];

module.exports.run = async (client, message, args) => {
    let toAdd = "To add a role, type:\n";
    let toRem = "To remove a role, type:\n"
    for(var i in roles){
    let role = message.guild.roles.find(role => role.name === roles[i]);
    toAdd = toAdd + "**`!addrole " + `${rolesCMD[i]}` + "`** - " + `**${roles[i]}**\n`;
    toRem = toRem + "**`!removerole " + `${rolesCMD[i]}` + "`** - " + `**${roles[i]}**\n`;
    }
    message.channel.send(toAdd + toRem);
}

module.exports.help = {
    name: "roles"
}