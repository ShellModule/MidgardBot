const roles = ['CTF Player', '1v1 Player', 'Climb/RunMode Player']
const rolesCMD = ['ctf', '1v1', 'climb/runmode']

module.exports.run = async (client, message, args) => {
  let rMember = message.member
  if (!args[0]) return message.channel.send('Type **`!roles`** for help <:uszanowanko:533764245339373588>')
  for (var i in roles) {
    if (args[0].toLowerCase() === rolesCMD[i]) {
      let role = message.guild.roles.find(role => role.name === roles[i])
      if (rMember.roles.has(role.id)) return message.reply('Already has that role.')
      await (rMember.addRole(role.id))
      message.channel.send(`Added **${role.name}** role to <@${rMember.id}>`)
      return
    }
  }
  return message.channel.send('Type **`!roles`** for help <:uszanowanko:533764245339373588>')
}

module.exports.help = {
  name: 'addrole'
}
