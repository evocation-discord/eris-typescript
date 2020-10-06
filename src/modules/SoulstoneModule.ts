import { command, getRandomInt, inhibitors, MAIN_GUILD_ID, Module, monitor, strings } from "@lib/utils";
import RedisClient from "@lib/utils/client/RedisClient";
import { SoulstoneGenerationChannel } from "@lib/utils/database/models";
import Discord from "discord.js";

export default class SoulstoneModule extends Module {

  @monitor({ event: "message" })
  async onMessage(message: Discord.Message): Promise<void> {
    if (message.channel.type === "dm") return;
    if (message.guild.id !== MAIN_GUILD_ID) return;
    if (message.author.bot) return;
    if (!await SoulstoneGenerationChannel.findOne({ where: { channel: message.channel.id } })) return;
    if (await RedisClient.get(`soulstone-generation:${message.channel.id}`)) return;
    const num = getRandomInt(1, 101) + 0.4 * 100;
    console.log(num);
    if (num > 100) {
      const dropAmount = getRandomInt(5, 21);
      message.channel.send(strings.modules.soulstones.generationMessage(dropAmount));
    }
  }

  // @command({ inhibitors: [inhibitors.botAdminsOnly], admin: true })
  // async gc(message: Message): Promise<void> {

  // }
}