module.exports.run = async (client, message, args) => {
  message.channel.send(
    'List of available commands:\n' +
        '**`!invitelink`** - link to our discord server\n' +
        '**`!roles`** - how to get a role\n' +
        '**`!linkfix`** - if links like this one <soldat://localhost:23073/pass>, doesnt work\n' +
        '**`!1v1`** - 1v1 matchmaking'
  )
}

module.exports.help = {
  name: 'cmdhelp'
}
