import { Module, command, inhibitors, Remainder } from "@lib/utils";
import { GuildMember, Message, TextChannel } from "discord.js";

export default class DonationCommandsModule extends Module {
  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [GuildMember, new Remainder(String)] })
  logdonation(msg: Message, member: GuildMember, item: string) {
    msg.delete();
    if(member.roles.cache.has(process.env.WHITE_HALLOWS))
      msg.channel.send(`**SUCCESS**: I have logged this donation; ${member.user} already has the <@&${process.env.WHITE_HALLOWS}> role.`, { allowedMentions: { roles: [], users: [] } });
    else {  
      member.roles.add(process.env.WHITE_HALLOWS);
      msg.channel.send(`**SUCCESS**: I have logged this donation and awarded ${member.user} with the <@&${process.env.WHITE_HALLOWS}> role.`, { allowedMentions: { roles: [], users: [] } });
    }
    (msg.guild.channels.resolve(process.env.DONATION_LOG) as TextChannel).send(`**\`${member.user.tag}\`** (\`${member.user.id}\`) donated **${item}**.`);
  }
}