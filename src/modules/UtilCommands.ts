import { Message } from "discord.js";
import { command, Module, inhibitors, monitor, ROLES, CommandCategories, strings, commandDescriptions } from "@lib/utils";

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

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], group: CommandCategories.Informational, description: commandDescriptions.privacypolicy, aliases: ["privacy"] })
  async privacypolicy(msg: Message): Promise<void> {
    try {
      await msg.author.send(strings.modules.util.privacypolicy.message1);
      await msg.author.send(strings.modules.util.privacypolicy.message2);
    } catch (e) {
      msg.channel.send(strings.general.error(strings.modules.util.privacypolicy.error));
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
    if (!message.member.roles.cache.some(r => [ROLES.EVOCATION_LACUNAE, ROLES.EVOCATION_OCULI, ROLES.SCIONS_OF_ELYSIUM, ROLES.SENTRIES_OF_DESCENSUS, ROLES.STAFF].includes(r.id))) return;
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
  }

  @command({ inhibitors: [inhibitors.canOnlyBeExecutedInBotCommands], group: CommandCategories.Informational, description: commandDescriptions.datamine })
  async datamine(msg: Message): Promise<void> {
    msg.channel.send(strings.modules.util.datamine);
  }
}