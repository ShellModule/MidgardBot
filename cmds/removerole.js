const roles = ['CTF Player', '1v1 Player', 'Climb/RunMode Player', 'LS Player']
const rolesCMD = ['ctf', '1v1', 'climb/runmode', 'ls']

module.exports.run = async (client, message, args) => {
  let rMember = message.member
  if (!args[0]) return message.channel.send('Type **`!roles`** for help <:uszanowanko:533764245339373588>')
  for (var i in roles) {
    if (args[0].toLowerCase() === rolesCMD[i]) {
      let role = message.guild.roles.find(role => role.name === roles[i])
      if (!rMember.roles.has(role.id)) return message.reply("Doesn't have that role.")
      await (rMember.removeRole(role.id))
      message.channel.send(`Removed **${role.name}** role from <@${rMember.id}>`)
      return
    }
  }
  return message.channel.send('Type **`!roles`** for help <:uszanowanko:533764245339373588>')
}

module.exports.help = {
  name: 'removerole'
}
