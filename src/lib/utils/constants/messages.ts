import { Message } from "discord.js";
import { emotes } from "./emotes";

export const RESPONSES = {
  SUCCESS: (msg: Message, text: string): string => `${msg.client.emojis.resolve(emotes.UNCATEGORISED.SUCCESS)} **SUCCESS**: ${msg}`,
};