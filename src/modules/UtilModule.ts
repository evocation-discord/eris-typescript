import { Message, GuildMember, TextChannel } from "discord.js";
import { command, Module, inhibitors, monitor, ROLES, CommandCategories, strings, commandDescriptions, errorMessage, CHANNELS, Embed, MAIN_GUILD_ID, emotes } from "@lib/utils";

export default class UtilCommandModule extends Module {

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], group: CommandCategories.Informational, description: commandDescriptions.about })
  about(msg: Message): Promise<Message> {
    return msg.channel.send(strings.modules.util.aboutCommand, { allowedMentions: { users: [] } });
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], group: CommandCategories.Informational, description: commandDescriptions.ping })
  async ping(msg: Message): Promise<void> {
    const message = await msg.channel.send(strings.modules.util.pinging);
    await message.edit(strings.modules.util.pingResponse(message.createdTimestamp - msg.createdTimestamp, msg.client.ws.ping));
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], group: CommandCategories.Informational, description: commandDescriptions.ping })
  async heartbeat(msg: Message): Promise<void> {
    const message = await msg.channel.send(strings.modules.util.pinging);
    await message.edit(strings.modules.util.heartBeatResponse(msg.client.ws.ping));
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], group: CommandCategories.Informational, description: commandDescriptions.privacypolicy, aliases: ["privacy"] })
  async privacypolicy(msg: Message): Promise<void> {
    try {
      await msg.author.send(strings.modules.util.privacypolicy.message1);
      await msg.author.send(strings.modules.util.privacypolicy.message2);
    } catch (e) {
      errorMessage(msg, strings.general.error(strings.general.dmsclosed));
    }
    try {
      await msg.delete();
    } catch (e) {
      null;
    }
  }

  @monitor({ event: "message" })
  onErisMessage(message: Message): void {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (!message.member.roles.cache.some(r => [ROLES.CHRONOS, ROLES.ORION, ROLES.SCIONS_OF_ELYSIUM, ROLES.SENTRIES_OF_DESCENSUS, ROLES.STAFF].includes(r.id))) return;
    if (["528593099971100672", "728243965987389442"].includes(message.channel.parentID)) return;
    const thankYouEris = () => {
      const random = Math.floor(Math.random() * 100 + 1);
      if (random % 2 === 1) return;
      let done = false;
      ["thanks eris", "thanks, eris", "thank you eris", "thank you, eris"].forEach(erisString => {
        if (message.content.toLowerCase().includes(erisString)) {
          if (done) return;
          message.channel.send(strings.modules.erisThanksMessage[Math.floor(Math.random() * strings.modules.erisThanksMessage.length)]);
          done = true;
        }
      });
    };
    thankYouEris();

    const goodnightEris = () => {
      const random = Math.floor(Math.random() * 100 + 1);
      if (random % 2 === 1) return;
      let done = false;
      ["goodnight eris", "night eris", "gn eris", "gngn eris"].forEach(erisString => {
        if (message.content.toLowerCase().includes(erisString)) {
          if (done) return;
          message.channel.send(strings.modules.erisGoodnightMessage[Math.floor(Math.random() * strings.modules.erisGoodnightMessage.length)](message));
          done = true;
        }
      });
    };
    goodnightEris();
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], group: CommandCategories.Informational, description: commandDescriptions.datamine })
  async datamine(msg: Message): Promise<void> {
    msg.channel.send(strings.modules.util.datamine);
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], group: CommandCategories.Informational, description: commandDescriptions.version })
  async version(msg: Message): Promise<void> {
    msg.channel.send(strings.general.version);
  }

  @command({ group: CommandCategories.Informational, description: commandDescriptions.staff })
  async staff(msg: Message): Promise<void> {
    const mainGuild = msg.client.guilds.resolve(MAIN_GUILD_ID);
    const members = mainGuild.members.cache;
    const admins = members.filter(m => m.roles.cache.has(ROLES.ADMINISTRATORS) || m.roles.cache.has(ROLES.LEAD_ADMINISTRATORS)).sort((a, b) => a.user.username.localeCompare(b.user.username)).array();
    const mods = members.filter(m => m.roles.cache.has(ROLES.MODERATOR) && !admins.includes(m)).sort((a, b) => a.user.username.localeCompare(b.user.username)).array();
    const serverGrowthLead = members.filter(m => m.roles.cache.has(ROLES.SERVER_GROWTH_LEAD)).sort((a, b) => a.user.username.localeCompare(b.user.username)).array();
    const developers = members.filter(m => m.roles.cache.has(ROLES.ERIS_DEVELOPER)).sort((a, b) => a.user.username.localeCompare(b.user.username)).array();

    const embed = new Embed()
      .setAuthor("Evocation Staff")
      .addField("Administrators", admins.map(this.formatStaffMessage).join("\n") || "This position has no occupants.")
      .addField("Moderators", mods.map(this.formatStaffMessage).join("\n") || "This position has no occupants.")
      .addField("Eris Developers", developers.map(this.formatStaffMessage).join("\n") || "This position has no occupants.")
      .addField("Outreach Lead", serverGrowthLead.map(this.formatStaffMessage).join("\n") || "This position has no occupants.")
      .setFooter("This command output updates automatically, dependent upon role attribution.");
    await msg.channel.send(embed);
  }

  formatStaffMessage(member: GuildMember): string {
    const status: string[] = [];
    const presence = member.user.presence;
    if (presence.activities.some((a) => a.type === "STREAMING")) status.push(emotes.commandresponses.badges.streaming);
    if (presence.status === "dnd") status.push(emotes.commandresponses.badges.donotdisturb);
    if (presence.status === "idle") status.push(emotes.commandresponses.badges.idle);
    if (presence.status === "offline") status.push(emotes.commandresponses.badges.offline);
    if (presence.status === "online") status.push(emotes.commandresponses.badges.online);
    status.push(`${member.user} (**\`${member.user.tag}\`** | \`${member.user.id}\`)`);
    return status.join(" ");
  }

  @monitor({ event: "guildMemberAdd" })
  async guildMemberAdd(member: GuildMember): Promise<void> {
    if (member.guild.id !== MAIN_GUILD_ID) return;
    if (member.user.bot) return;
    const channel = await member.client.channels.fetch(CHANNELS.LOUNGE) as TextChannel;
    channel.send(`Welcome, ${member.user} (\`${member.user.tag}\`), to Evocation. See <#528593800839561216> and <#528593834947379239>. We now have **${member.guild.memberCount}** members.`);
  }
}
