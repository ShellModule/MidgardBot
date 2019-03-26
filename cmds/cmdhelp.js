module.exports.run = async (client, message, args) => {
  message.channel.send(
    '__List of available commands:__\n' +
        '  **`!invitelink`** - *link to our discord server*\n' +
        '  **`!roles`** - *how to get a role*\n' +
        '  **`!linkfix`** - *if links like this one <soldat://localhost:23073/pass>, doesnt work*\n' +
        '  **`!1v1`** - *1v1 matchmaking*\n' +
        '  **`!ctfstatus`** - *detailed information on **Midgard [CTF]** server*\n' +
        '  **`!msg help`** - *how to send a message to our servers*'
  )
}

module.exports.help = {
  name: 'cmdhelp'
}
