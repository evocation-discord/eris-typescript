import { ErisClient } from "@utils/client";
import { Module } from "@utils/modules";
import Discord from "discord.js";

const eventArray: (keyof Discord.ClientEvents)[] = [
  "message",
  "messageUpdate",
  "messageDelete",
  "messageReactionAdd",
  "emojiCreate",
  "emojiDelete",
  "emojiUpdate",
  "guildMemberUpdate",
  "userUpdate",
  "guildMemberRoleRemove",
  "guildMemberRoleAdd",
  "guildMemberAdd"
];

export default class ListenerMonitorInit extends Module {
  constructor(client: ErisClient) {
    super(client);

    for (const event of eventArray) {
      this.client.on(event, (...args: unknown[]) => Array.from(this.client.monitorManager.monitors).filter(m => m.event === event).forEach(monitor => monitor.func.call(monitor.module, ...args)));
    }
  }
}