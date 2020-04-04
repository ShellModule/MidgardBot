module.exports.run = async (client, message, args) => {
  message.channel.send(
    '__List of available commands:__\n' +
        '  **`!invitelink`** - *link to our discord server*\n' +
        '  **`!roles`** - *how to get a role*\n' +
        '  **`!linkfix`** - *if links like this one <soldat://localhost:23073/pass>, won\'t work*\n' +
        // '  **`!1v1`** - *1v1 matchmaking*\n' +
        '  **`!status`** - *servers detailed information*\n'
        // '  **`!msg help`** - *how to send a message to our servers*\n' +
        // '  **`!hnsmp`** - *map pack for Hide & Seek server*'
  )
}

module.exports.help = {
  name: 'cmdhelp'
}
