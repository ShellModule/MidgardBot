module.exports.run = async (client, message, args) => {
  message.channel.send(
    '__List of available commands:__\n' +
        '  **`!invite`** - *link to our discord server*\n' +
        '  **`!roles`** - *easy way to get multiple roles*\n' +
        '  **`!linkfix`** - *if links like this one <soldat://localhost:23073/pass>, won\'t work*\n' +
        '  **`!status`** - *servers detailed information*\n'
  )
}

module.exports.help = {
  name: 'cmdhelp'
}
