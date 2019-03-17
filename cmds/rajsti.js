const Discord = require("discord.js");

module.exports.run = async (client, message, args) => {
    message.channel.send(
        "Roses are red violets are blue\n" +
        "Rajsti is **fat** and you know it too <:topkek:533770614368894987>"
    )
}

module.exports.help = {
    name: "rajsti"
}