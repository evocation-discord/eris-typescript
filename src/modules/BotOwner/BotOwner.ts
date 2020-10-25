import { command, CommandCategories } from "@utils/commands";
import { emotes, regex } from "@utils/constants";
import strings, { commandDescriptions } from "@utils/messages";
import { Module } from "@utils/modules";
import * as Arguments from "@utils/arguments";
import Discord, { DataResolver } from "discord.js";
import { inspect } from "util";
import { DisabledCommand } from "@database/models";
import { inhibitors } from "@utils/inhibitors/Inhibitor";
import Embed from "@utils/embed";

export default class BotOwner extends Module {
  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], args: [Arguments.TextChannel, new Arguments.Remainder(String)], admin: true, usage: "<channel:textchannel|snowflake> <content:...string>", description: commandDescriptions.send
  })
  send(msg: Discord.Message, channel: Discord.TextChannel, args: string): void {
    msg.delete();
    channel.send(args, { allowedMentions: { parse: [], users: [], roles: [] } });
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], args: [String], admin: true, usage: "<status:online|idle|dnd|invisible>", description: commandDescriptions.setstatus
  })
  setstatus(msg: Discord.Message, status: "online" | "idle" | "dnd" | "invisible" | string): Promise<Discord.Message | void> {
    const discordStatus = status as Discord.PresenceStatusData;
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
        return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.botmaintainer.statusError));
    }
    return msg.channel.send(strings.general.success(strings.modules.botmaintainer.statusSet(status)));
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], args: [String, new Arguments.Remainder(String)], admin: true, usage: "<status:watching|playing|listening>", description: commandDescriptions.setgame
  })
  setgame(msg: Discord.Message, type: "watching" | "playing" | "listening", game: string): Promise<Discord.Message | void> {
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
        return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.botmaintainer.gameError));
    }
    return msg.channel.send(strings.general.success(strings.modules.botmaintainer.gameSet(type, game)));
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], args: [String, new Arguments.Remainder(String)], admin: true, usage: "<messageLink:string> <newContent:...string>", description: commandDescriptions.edit
  })
  async edit(msg: Discord.Message, messageLink: string, newContent: string): Promise<Discord.Message | void> {
    let isError = false;
    const executedRegex = regex.messageLink.exec(messageLink);
    if (!executedRegex) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.util.linkDoesNotMatchDiscordLink));
    const [, guildId, channelId, messageId] = executedRegex;
    const guild = this.client.guilds.resolve(guildId);
    if (!guild) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.util.guildWasNotFound(guildId)));
    const channel = guild.channels.resolve(channelId) as Discord.TextChannel;
    if (!channel) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.util.channelWasNotFound(channelId)));
    const message = await channel.messages.fetch(messageId);
    if (!message) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.util.messageWasNotFound(messageId)));
    await message.edit(newContent).catch(() => isError = true);
    if (isError) return strings.errors.errorMessage(msg, strings.errors.error(strings.errors.somethingWentWrong));
    return msg.channel.send(strings.general.success(strings.modules.util.messageEdited));
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], args: [new Arguments.Remainder(String)], aliases: ["ev"], admin: true, usage: "<code:...string>", description: commandDescriptions.eval
  })
  async eval(msg: Discord.Message, code: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { client } = msg;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const isErisCool = (): boolean => true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const isErisFunny = (): boolean => true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const createEmoji = async (attachment: Discord.BufferResolvable | Discord.Base64Resolvable, name: string, { roles, reason }: { roles?: Discord.Collection<Discord.Snowflake, Discord.Role> | Discord.RoleResolvable[], reason?: string } = {}): Promise<unknown> => {
      attachment = await DataResolver.resolveImage(attachment);
      if (!attachment) throw new TypeError("REQ_RESOURCE_TYPE");

      const data: { image: string, name: string, roles?: string[] } = { image: attachment, name };
      if (roles) {
        data.roles = [];
        for (let role of roles instanceof Discord.Collection ? roles.values() : roles) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          role = msg.guild.roles.resolve(role);
          if (!role) {
            return Promise.reject(
              new Error("options.roles isnt Array or Collection of Roles or Snowflakes")
            );
          }
          data.roles.push(role.id);
        }
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return msg.client.api.guilds(msg.guild.id).emojis.post({ data, reason });
    };
    // eslint-disable-next-line no-shadow, global-require
    const Discord = require("discord.js");
    // eslint-disable-next-line no-shadow, global-require, @typescript-eslint/no-unused-vars, no-unused-vars
    const DatabaseModels = require("@database/models");
    try {
      const evaled = eval(code);
      const clean = await codeclean(msg.client, evaled);
      msg.channel.send(`\`\`EVAL\`\`\n\`\`\`xl\n${clean}\`\`\``);
    } catch (err) {
      msg.channel.send(`\`ERROR\` \`\`\`xl\n${await codeclean(msg.client, err)}\n\`\`\``);
    }
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], aliases: ["kill", "die"], admin: true, description: commandDescriptions.shutdown
  })
  async shutdown(msg: Discord.Message): Promise<void> {
    await msg.channel.send(strings.general.success(strings.modules.botmaintainer.shutdown));
    process.exit(0);
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], args: [String], group: CommandCategories["Bot Maintainers"], admin: true, description: commandDescriptions.disablecmd, usage: "<command:string>"
  })
  async disablecmd(msg: Discord.Message, cmd: string): Promise<Discord.Message | void> {
    if (["enablecmd", "disablecmd", "listdisabledcommands", "ldc"].includes(cmd)) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.botmaintainer.cantdisablecommands));
    const commandToDisable = this.client.commandManager.getByTrigger(cmd);
    const commandName = commandToDisable.triggers[0];
    if (await DisabledCommand.findOne({ where: { commandName } })) return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.botmaintainer.alreadydisabled));
    await DisabledCommand.create({
      disabledBy: msg.author.id,
      commandName: cmd
    }).save();
    return msg.channel.send(strings.general.success(strings.modules.botmaintainer.disabledcommand));
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], args: [String], group: CommandCategories["Bot Maintainers"], admin: true, description: commandDescriptions.enablecmd, usage: "<command:string>"
  })
  async enablecmd(msg: Discord.Message, cmd: string): Promise<Discord.Message | void> {
    const commandToEnable = this.client.commandManager.getByTrigger(cmd);
    const commandName = commandToEnable.triggers[0];
    if (await DisabledCommand.findOne({ where: { commandName } })) {
      const disabled = await DisabledCommand.findOne({ where: { commandName } });
      await disabled.remove();
      return msg.channel.send(strings.general.success(strings.modules.botmaintainer.undisabledcommand));
    } return strings.errors.errorMessage(msg, strings.errors.error(strings.modules.botmaintainer.notdisabledcommand));
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], aliases: ["ldc"], admin: true, description: commandDescriptions.listdisabledcmds
  })
  async listdisabledcmds(msg: Discord.Message): Promise<Discord.Message> {
    const disabledcommands = await DisabledCommand.find();
    const embed = new Embed()
      .setAuthor(strings.modules.botmaintainer.disabledCommandsEmbedHeader)
      .setDescription(disabledcommands.map(strings.modules.botmaintainer.disabledCommandMap).join("\n") || strings.modules.botmaintainer.noDisabledCommands);
    return msg.channel.send(embed);
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], admin: true, description: commandDescriptions.channels
  })
  async channels(message: Discord.Message): Promise<void> {
    if ((message.channel as Discord.TextChannel).name !== "administrator-bot-commands") return;
    const channels = message.guild.channels.cache.array();
    const categories = channels.filter((c) => c.type === "category").sort((a, b) => a.rawPosition - b.rawPosition);
    const list: string[] = [];
    for await (const category of categories) {
      list.push(`${list.length > 0 ? "\n" : ""}${emotes.commandresponses.channels.expandedcategory} **${category.name.toUpperCase()}**`);
      const channelsInCategory = channels.filter((c) => c.parentID === category.id).sort((a, b) => a.rawPosition - b.rawPosition);
      for await (const channel of channelsInCategory) {
        if (channel.type === "voice") list.push(`${channel.permissionOverwrites.find((overwrite) => overwrite.deny.has("VIEW_CHANNEL") || overwrite.deny.has("CONNECT")) ? emotes.commandresponses.channels.privatevoicechannel : emotes.commandresponses.channels.voicechannel} ${channel.name} (\`${channel.id}\`)`);
        if (channel.type === "news") list.push(`${channel.permissionOverwrites.find((overwrite) => overwrite.deny.has("VIEW_CHANNEL")) ? emotes.commandresponses.channels.privateannouncementchannel : emotes.commandresponses.channels.announcementchannel} ${channel.name} (\`${channel.id}\`)`);
        if (channel.type === "text") list.push(`${channel.permissionOverwrites.find((overwrite) => overwrite.deny.has("VIEW_CHANNEL")) ? emotes.commandresponses.channels.privatetextchannel : emotes.commandresponses.channels.textchannel} ${channel.name} (\`${channel.id}\`)`);
      }
    }
    await message.channel.send(list.join("\n"), { split: true });
  }

  @command({
    inhibitors: [inhibitors.botMaintainersOnly], group: CommandCategories["Bot Maintainers"], admin: true, description: commandDescriptions.emojis, usage: "[server:guild]", args: [new Arguments.Optional(Arguments.Guild)]
  })
  async emojis(message: Discord.Message, server?: Discord.Guild): Promise<void> {
    await message.delete();
    if (!server) server = message.guild;
    const emojis = server.emojis.cache.array();
    await message.channel.send([strings.modules.botmaintainer.emojis.messageHeader(server), emojis.sort((a, b) => a.name.localeCompare(b.name)).map((emoji) => `${emoji} \`:${emoji.name}:\` \\${emoji}`).join("\n")].join("\n"), { split: true });
  }
}

const codeclean = async (client: Discord.Client, text: string): Promise<string> => {
  if (text && text.constructor.name === "Promise") { text = await text; }
  if (typeof text !== "string") {
    text = inspect(text, {
      depth: 0
    });
  }
  text = text
    .replace(/`/g, `\`${String.fromCharCode(8203)}`)
    .replace(/@/g, `@${String.fromCharCode(8203)}`)
    .replace(client.token, "http://discord.com/developers");
  return text;
};
