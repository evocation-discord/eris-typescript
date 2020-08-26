import { Module, command, inhibitors, Remainder, CHANNELS, ROLES, monitor, RESPONSES, timeFormatter, emotes } from "@lib/utils";
import { GuildMember, Message, TextChannel } from "discord.js";

export default class DonationCommandsModule extends Module {
  @monitor({ events: ["guildMemberUpdate"] })
  async onGuildMemberRoleAdd(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (!oldMember.roles.cache.has(ROLES.WHITE_HALLOWS) && newMember.roles.cache.has(ROLES.WHITE_HALLOWS)) {
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
      const firstEntry = auditLogs.entries.first();
      if (!(firstEntry.changes[0].key === "$add" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id)))
        newMember.roles.remove(ROLES.WHITE_HALLOWS, "[FORCED REVOCATION] Authenticity cannot be verified.");
    }
  }
  @command({ inhibitors: [inhibitors.adminOnly], group: "Server Administrator", args: [GuildMember, new Remainder(String)], aliases: ["ld"], staff: true, usage: "<member:member|snowflake> <item:...string>" })
  logdonation(msg: Message, member: GuildMember, item: string): void {
    msg.delete();
    if (member.roles.cache.has(ROLES.WHITE_HALLOWS))
      msg.channel.send(RESPONSES.SUCCESS(msg, `I have logged this donation; ${member.user} already has the <@&${ROLES.WHITE_HALLOWS}> role.`), { allowedMentions: { roles: [], users: [] } }).then(msg => setTimeout(() => msg.delete(), 5000));
    else {
      member.roles.add(ROLES.WHITE_HALLOWS);
      msg.channel.send(RESPONSES.SUCCESS(msg, `I have logged this donation and awarded ${member.user} with the <@&${ROLES.WHITE_HALLOWS}> role.`), { allowedMentions: { roles: [], users: [] } }).then(msg => setTimeout(() => msg.delete(), 5000));
    }
    (msg.guild.channels.resolve(CHANNELS.DONATION_LOG) as TextChannel).send(`\`[${timeFormatter()}]\` ${this.client.emojis.resolve(emotes.LOGGING.DONATION)} **\`${member.user.tag}\`** (\`${member.user.id}\`) donated **${item}**. This donation was logged by **\`${msg.author.tag}\`** (\`${msg.author.id}\`).`);
  }
}