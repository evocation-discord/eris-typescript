import { Module, command, inhibitors, Remainder, listener } from "@lib/utils";
import { GuildMember, Message, TextChannel } from "discord.js";

export default class DonationCommandsModule extends Module {
  @listener({ event: "guildMemberUpdate" })
  async onGuildMemberRoleAdd(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (!oldMember.roles.cache.has(process.env.WHITE_HALLOWS) && newMember.roles.cache.has(process.env.WHITE_HALLOWS)) {
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
      const firstEntry = auditLogs.entries.first();
      if (!(firstEntry.changes[0].key === "$add" && firstEntry.executor.id === this.client.user.id))
        newMember.roles.remove(process.env.WHITE_HALLOWS, "[FORCED REVOCATION] Authenticity cannot be verified.");
    }
  }
  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [GuildMember, new Remainder(String)], aliases: ["ld"] })
  logdonation(msg: Message, member: GuildMember, item: string): void {
    msg.delete();
    if (member.roles.cache.has(process.env.WHITE_HALLOWS))
      msg.channel.send(`**SUCCESS**: I have logged this donation; ${member.user} already has the <@&${process.env.WHITE_HALLOWS}> role.`, { allowedMentions: { roles: [], users: [] } }).then(msg => setTimeout(() => msg.delete(), 5000));
    else {
      member.roles.add(process.env.WHITE_HALLOWS);
      msg.channel.send(`**SUCCESS**: I have logged this donation and awarded ${member.user} with the <@&${process.env.WHITE_HALLOWS}> role.`, { allowedMentions: { roles: [], users: [] } }).then(msg => setTimeout(() => msg.delete(), 5000));
    }
    (msg.guild.channels.resolve(process.env.DONATION_LOG) as TextChannel).send(`**\`${member.user.tag}\`** (\`${member.user.id}\`) donated **${item}**.`);
  }
}