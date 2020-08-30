import { monitor, Module, ErisClient, CHANNELS, MAIN_GUILD_ID, ROLES, command, inhibitors } from "@lib/utils";
import { strings, commandDescriptions } from "@lib/utils/messages";
import { GuildMember, Message } from "discord.js";

export default class PurchaseableRolesModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @monitor({ event: "guildMemberUpdate" })
  async onGuildMemberRoleAdd(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    if (newMember.guild.id !== MAIN_GUILD_ID) return;
    const roles = [ROLES.SENTRIES_OF_DESCENSUS, ROLES.SCIONS_OF_ELYSIUM, ROLES.EVOCATION_OCULI, ROLES.EVOCATION_LACUNAE];
    for (const role of roles) {
      if (!oldMember.roles.cache.has(role) && newMember.roles.cache.has(role)) {
        const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
        const firstEntry = auditLogs.entries.first();
        if (!(firstEntry.changes[0].key === "$add" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id)))
          newMember.roles.remove(role, strings.modules.purchaseableroles.auditLogRoleAdd);
      }
    }
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands, inhibitors.onlySomeRolesCanExecute(["SCIONS OF ELYSIUM", "SENTRIES OF DESCENSUS", "STAFF", "WISTERIA"]), inhibitors.userCooldown(30000)], group: "Purchasable Role Limitation", description: commandDescriptions.muse })
  async muse(message: Message): Promise<void> {
    message.channel.send(strings.modules.purchaseableroles.museCommand[Math.floor(Math.random() * strings.modules.purchaseableroles.museCommand.length)]);
  }
}