import { getRandomInt, MAIN_GUILD_ID, Module, monitor } from "@lib/utils";
import Discord from "discord.js";

export default class SoulstoneModule extends Module {

  @monitor({ event: "message" })
  async onMessage(message: Discord.Message): Promise<void> {
    if (message.guild.id !== MAIN_GUILD_ID) return;
    if (message.author.bot) return;
    for (let index = 0; index < 100; index++) {
      const num = getRandomInt(1, 101) + 0.005 * 100;
      if (num > 100) {
        const dropAmount = getRandomInt(5, 21);
        console.log(dropAmount);
      }
    }
  }
}