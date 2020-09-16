import { Module, CommandCategories, command, inhibitors, Remainder, messageLinkRegex, commandDescriptions, strings, Embed, emotes } from "@lib/utils";
import { TextChannel, Message, PresenceStatusData } from "discord.js";
import { inspect } from "util";
import { DisabledCommand } from "@database/models";
import { Client } from "discord.js";

export default class BotOwner extends Module {

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: CommandCategories["Bot Owner"], args: [TextChannel, new Remainder(String)], admin: true, usage: "<channel:textchannel|snowflake> <content:...string>", description: commandDescriptions.send })
  send(msg: Message, channel: TextChannel, args: string): void {
    msg.delete();
    channel.send(args, { allowedMentions: { parse: [], users: [], roles: [] } });
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: CommandCategories["Bot Owner"], args: [String], admin: true, usage: "<status:online|idle|dnd|invisible>", description: commandDescriptions.setstatus })
  setstatus(msg: Message, status: "online" | "idle" | "dnd" | "invisible" | string): Promise<Message> {
    const discordStatus = status as PresenceStatusData;
    switch (discordStatus) {
    case "online":
      status = status.toUpperCase();
      this.client.user.setStatus(discordStatus);
      break;
    case "dnd":
      status = "DO NOT DISTURB";
      this.client.user.setStatus(discordStatus);
      break;

    case "idle":
      status = status.toUpperCase();
      this.client.user.setStatus(discordStatus);
      break;

    case "invisible":
      status = status.toUpperCase();
      this.client.user.setStatus(discordStatus);
      break;

    default:
      return msg.channel.send(strings.general.error(strings.modules.util.statusError));

    }
    return msg.channel.send(strings.general.success(strings.modules.util.statusSet(status)));
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: CommandCategories["Bot Owner"], args: [String, new Remainder(String)], admin: true, usage: "<status:watching|playing|listening>", description: commandDescriptions.setgame })
  setgame(msg: Message, type: "watching" | "playing" | "listening", game: string): Promise<Message> {
    switch (type) {
    case "listening":
      this.client.user.setActivity(game, { type: "LISTENING" });
      break;
    case "watching":
      this.client.user.setActivity(game, { type: "WATCHING" });
      break;
    case "playing":
      this.client.user.setActivity(game, { type: "PLAYING" });
      break;
    default:
      return msg.channel.send(strings.general.error(strings.modules.util.gameError));
    }
    return msg.channel.send(strings.general.success(strings.modules.util.gameSet(type, game)));
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: CommandCategories["Bot Owner"], args: [String, new Remainder(String)], admin: true, usage: "<messageLink:string> <newContent:...string>", description: commandDescriptions.edit })
  async edit(msg: Message, messageLink: string, newContent: string): Promise<Message> {
    let isError = false;
    const executedRegex = messageLinkRegex.exec(messageLink);
    if (!executedRegex) return msg.channel.send(strings.general.error(strings.modules.util.linkDoesNotMatchDiscordLink));
    const [, guildId, channelId, messageId] = executedRegex;
    const guild = this.client.guilds.resolve(guildId);
    if (!guild) return msg.channel.send(strings.general.error(strings.modules.util.guildWasNotFound(guildId)));
    const channel = guild.channels.resolve(channelId) as TextChannel;
    if (!channel) return msg.channel.send(strings.general.error(strings.modules.util.channelWasNotFound(channelId)));
    const message = await channel.messages.fetch(messageId);
    if (!message) return msg.channel.send(strings.general.error(strings.modules.util.messageWasNotFound(messageId)));
    await message.edit(newContent).catch(_ => isError = true);
    if (isError) return msg.channel.send(strings.general.error(strings.general.somethingWentWrong));
    return msg.channel.send(strings.general.success(strings.modules.util.messageEdited));
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: CommandCategories["Bot Owner"], args: [new Remainder(String)], aliases: ["ev"], admin: true, usage: "<code:...string>", description: commandDescriptions.eval })
  async eval(msg: Message, code: string): Promise<void> {
    const client = msg.client;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Discord = require("discord.js");
    try {
      const evaled = eval(code);
      const clean = await codeclean(msg.client, evaled);
      msg.channel.send(`\`\`EVAL\`\`\n\`\`\`xl\n${clean}\`\`\``);
    }
    catch (err) {
      msg.channel.send(`\`ERROR\` \`\`\`xl\n${await codeclean(msg.client, err)}\n\`\`\``);
    }
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: CommandCategories["Bot Owner"], aliases: ["kill", "die"], admin: true, description: commandDescriptions.shutdown })
  async shutdown(msg: Message): Promise<void> {
    await msg.channel.send(strings.general.success(strings.modules.util.shutdown));
    process.exit(0);
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [String], group: CommandCategories["Bot Owner"], admin: true, description: commandDescriptions.disablecmd, usage: "<command:string>" })
  async disablecmd(msg: Message, cmd: string): Promise<Message> {
    if (["enablecmd", "disablecmd", "listdisabledcommands", "ldc"].includes(cmd)) return msg.channel.send(strings.general.error(strings.modules.util.cantdisablecommands));
    const command = this.client.commandManager.getByTrigger(cmd);
    const commandName = command.triggers[0];
    if (await DisabledCommand.findOne({ where: { commandName: commandName } })) return msg.channel.send(strings.general.error(strings.modules.util.alreadydisabled));
    await DisabledCommand.create({
      disabledBy: msg.author.id,
      commandName: cmd
    }).save();
    return msg.channel.send(strings.general.success(strings.modules.util.disabledcommand));
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], args: [String], group: CommandCategories["Bot Owner"], admin: true, description: commandDescriptions.enablecmd, usage: "<command:string>" })
  async enablecmd(msg: Message, cmd: string): Promise<Message> {
    const command = this.client.commandManager.getByTrigger(cmd);
    const commandName = command.triggers[0];
    if (await DisabledCommand.findOne({ where: { commandName: commandName } })) {
      const disabled = await DisabledCommand.findOne({ where: { commandName: commandName } });
      await disabled.remove();
      return msg.channel.send(strings.general.success(strings.modules.util.undisabledcommand));
    } else return msg.channel.send(strings.general.error(strings.modules.util.notdisabledcommand));
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: CommandCategories["Bot Owner"], aliases: ["ldc"], admin: true, description: commandDescriptions.listdisabledcmds })
  async listdisabledcmds(msg: Message): Promise<Message> {
    const disabledcommands = await DisabledCommand.find();
    const embed = new Embed()
      .setAuthor(strings.modules.util.disabledCommandsEmbedHeader)
      .setDescription(disabledcommands.map(strings.modules.util.disabledCommandMap).join("\n") || strings.modules.util.noDisabledCommands);
    return msg.channel.send(embed);
  }

  @command({ inhibitors: [inhibitors.botAdminsOnly], group: CommandCategories["Bot Owner"], admin: true, description: commandDescriptions.channels })
  async channels(message: Message): Promise<void> {
    if ((message.channel as TextChannel).name !== "administrator-bot-commands") return;
    const channels = message.guild.channels.cache.array();
    const categories = channels.filter(c => c.type === "category").sort((a, b) => a.rawPosition - b.rawPosition);
    const list: string[] = [];
    for await (const category of categories) {
      list.push(`${list.length > 0 ? "\n" : ""}${emotes.commandresponses.channels.expandedcategory} **${category.name.toUpperCase()}**`);
      const channelsInCategory = channels.filter(c => c.parentID === category.id).sort((a, b) => a.rawPosition - b.rawPosition);
      for await (const channel of channelsInCategory) {
        if (channel.type === "voice") list.push(`${channel.permissionOverwrites.find(overwrite => overwrite.deny.has("VIEW_CHANNEL") || overwrite.deny.has("CONNECT")) ? emotes.commandresponses.channels.privatevoicechannel : emotes.commandresponses.channels.voicechannel} ${channel.name} (\`${channel.id}\`)`);
        if (channel.type === "news") list.push(`${channel.permissionOverwrites.find(overwrite => overwrite.deny.has("VIEW_CHANNEL")) ? emotes.commandresponses.channels.privateannouncementchannel : emotes.commandresponses.channels.announcementchannel} ${channel.name} (\`${channel.id}\`)`);
        if (channel.type === "text") list.push(`${channel.permissionOverwrites.find(overwrite => overwrite.deny.has("VIEW_CHANNEL")) ? emotes.commandresponses.channels.privatetextchannel : emotes.commandresponses.channels.textchannel} ${channel.name} (\`${channel.id}\`)`);
      }
    }
    await message.channel.send(list.join("\n"), { split: true });
  }
}

const codeclean = async (client: Client, text: string): Promise<string> => {
  if (text && text.constructor.name === "Promise")
    text = await text;
  if (typeof text !== "string")
    text = inspect(text, {
      depth: 0
    });
  text = text
    .replace(/`/g, `\`${String.fromCharCode(8203)}`)
    .replace(/@/g, `@${String.fromCharCode(8203)}`)
    .replace(client.token, "http://discord.com/developers");
  return text;
};