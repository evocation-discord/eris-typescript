import { ErisClient } from "@utils/client";
import { command, CommandCategories } from "@utils/commands";
import { env } from "@utils/constants";
import { inhibitors } from "@utils/inhibitors/Inhibitor";
import { strings, commandDescriptions, errorMessage } from "@utils/messages";
import { Module } from "@utils/modules";
import { monitor } from "@utils/monitor";
import * as Arguments from "@utils/arguments";
import Discord from "discord.js";

export default class PurchaseableRolesModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @monitor({ event: "guildMemberUpdate" })
  async onGuildMemberRoleAdd(oldMember: Discord.GuildMember, newMember: Discord.GuildMember): Promise<void> {
    if (newMember.guild.id !== env.MAIN_GUILD_ID) return;
    const roles = [env.ROLES.SENTRIES_OF_DESCENSUS, env.ROLES.SCIONS_OF_ELYSIUM, env.ROLES.ORION, env.ROLES.CHRONOS];
    for await (const role of roles) {
      if (!oldMember.roles.cache.has(role) && newMember.roles.cache.has(role)) {
        const auditLogs = await newMember.guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" });
        const firstEntry = auditLogs.entries.first();
        if (!(firstEntry.changes[0].key === "$add" && ["242730576195354624", this.client.user.id].includes(firstEntry.executor.id))) { newMember.roles.remove(role, strings.modules.purchaseableroles.auditLogRoleAdd); }
      }
    }
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands, inhibitors.onlySomeRolesCanExecute(["SCIONS OF ELYSIUM", "SENTRIES OF DESCENSUS", "STAFF", "EOS"]), inhibitors.userCooldown(30000)], group: CommandCategories["Purchasable Role Limitation"], description: commandDescriptions.muse })
  async muse(message: Discord.Message): Promise<void> {
    message.channel.send(strings.modules.purchaseableroles.museCommand[Math.floor(Math.random() * strings.modules.purchaseableroles.museCommand.length)]);
  }

  @command({
    inhibitors: [inhibitors.onlySomeRolesCanExecute(["SCIONS OF ELYSIUM", "SENTRIES OF DESCENSUS", "STAFF", "EOS", "ORION"]), inhibitors.userCooldown(600000)], usage: "<user:user>", args: [Arguments.User], group: CommandCategories["Purchasable Role Limitation"], description: commandDescriptions.cancel
  })
  async cancel(message: Discord.Message, user: Discord.User): Promise<Discord.Message|void> {
    const guild = message.client.guilds.resolve(env.MAIN_GUILD_ID);
    if (message.author === user) return errorMessage(message, strings.general.error(strings.modules.purchaseableroles.cantCancelYourself));
    if (user.id === message.client.user.id) return errorMessage(message, strings.general.error(strings.modules.purchaseableroles.cantCancelEris));
    if (guild.members.resolve(user).roles.cache.has(env.ROLES.ADMINISTRATORS) || guild.members.resolve(user).roles.cache.has(env.ROLES.LEAD_ADMINISTRATORS)) return message.channel.send(strings.general.error(strings.modules.purchaseableroles.cantCancelAdmins));
    const random = Math.round(Math.random());
    if (random === 1) return message.channel.send(strings.general.success(strings.modules.purchaseableroles.cancel_0(user)));
    if (random === 0) return message.channel.send(strings.modules.purchaseableroles.cancel_1(user));
  }

  @command({
    inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands, inhibitors.onlySomeRolesCanExecute(["SCIONS OF ELYSIUM", "SENTRIES OF DESCENSUS", "STAFF", "EOS", "ORION", "CHRONOS"])], group: CommandCategories["Purchasable Role Limitation"], description: commandDescriptions.educateme, aliases: ["enlighten", "enlightenme", "educate"]
  })
  async educateme(message: Discord.Message): Promise<void> {
    message.channel.send([strings.modules.purchaseableroles.educatemePrefix, strings.modules.purchaseableroles.educateme[Math.floor(Math.random() * strings.modules.purchaseableroles.educateme.length)]].join(" "));
  }
}
