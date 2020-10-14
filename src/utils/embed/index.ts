import { MessageEmbed, MessageEmbedOptions } from "discord.js";

export default class Embed extends MessageEmbed {
  constructor(data?: MessageEmbed | MessageEmbedOptions) {
    super({ color: "EECC41", ...data });
  }
}
