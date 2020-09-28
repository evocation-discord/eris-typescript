import { monitor, Module, ErisClient, MAIN_GUILD_ID, ROLES, command, inhibitors, strings, CommandCategories, commandDescriptions, messageLinkRegex, errorMessage } from "@lib/utils";
import { GuildMember, Message, User } from "discord.js";

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

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands, inhibitors.onlySomeRolesCanExecute(["SCIONS OF ELYSIUM", "SENTRIES OF DESCENSUS", "STAFF", "WISTERIA"]), inhibitors.userCooldown(30000)], group: CommandCategories["Purchasable Role Limitation"], description: commandDescriptions.muse })
  async muse(message: Message): Promise<void> {
    message.channel.send(strings.modules.purchaseableroles.museCommand[Math.floor(Math.random() * strings.modules.purchaseableroles.museCommand.length)]);
  }

  @command({ inhibitors: [inhibitors.onlySomeRolesCanExecute(["SCIONS OF ELYSIUM", "SENTRIES OF DESCENSUS", "STAFF", "WISTERIA", "EVOCATION OCULI"]), inhibitors.userCooldown(600000)], usage: "<user:user>", args: [User], group: CommandCategories["Purchasable Role Limitation"], description: commandDescriptions.cancel })
  async cancel(message: Message, user: User): Promise<Message|void> {
    const guild = message.client.guilds.resolve(MAIN_GUILD_ID);
    if (message.author === user) return errorMessage(message, strings.general.error(strings.modules.purchaseableroles.cantCancelYourself));
    if (user.id === message.client.user.id) return errorMessage(message, strings.general.error(strings.modules.purchaseableroles.cantCancelEris));
    if (guild.members.resolve(user).roles.cache.has(ROLES.ADMINISTRATORS) || guild.members.resolve(user).roles.cache.has(ROLES.LEAD_ADMINISTRATORS)) return message.channel.send(strings.general.error(strings.modules.purchaseableroles.cantCancelAdmins));
    const random = Math.round(Math.random());
    if (random === 1) return message.channel.send(strings.general.success(strings.modules.purchaseableroles.cancel_0(user)));
    if (random === 0) return message.channel.send(strings.modules.purchaseableroles.cancel_1(user));
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands, inhibitors.onlySomeRolesCanExecute(["SCIONS OF ELYSIUM", "SENTRIES OF DESCENSUS", "STAFF", "WISTERIA", "EVOCATION OCULI", "EVOCATION LACUNAE"])], group: CommandCategories["Purchasable Role Limitation"], description: commandDescriptions.educateme, aliases: ["enlighten", "enlightenme", "educate"] })
  async educateme(message: Message): Promise<void> {
    message.channel.send([strings.modules.purchaseableroles.educatemePrefix, strings.modules.purchaseableroles.educateme[Math.floor(Math.random() * strings.modules.purchaseableroles.educateme.length)]].join(" "));
  }
}