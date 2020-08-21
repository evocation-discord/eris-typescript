import { listener, Module, ErisClient, Monitor } from "@lib/utils";
import { ClientEvents } from "discord.js";

export default class ListenerMonitorInit extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @listener({ event: "message" })
  message(...args: unknown[]): void {
    setupMonitor(this.client.monitorManager.monitors, "message", ...args);
  }

  @listener({ event: "messageUpdate" })
  messageUpdate(...args: unknown[]): void {
    setupMonitor(this.client.monitorManager.monitors, "messageUpdate", ...args);
  }

  @listener({ event: "messageDelete" })
  messageDelete(...args: unknown[]): void {
    setupMonitor(this.client.monitorManager.monitors, "messageDelete", ...args);
  }

  @listener({ event: "messageReactionAdd" })
  messageReactionAdd(...args: unknown[]): void {
    setupMonitor(this.client.monitorManager.monitors, "messageReactionAdd", ...args);
  }
}

const setupMonitor = (monitors: Set<Monitor>, event: keyof ClientEvents, ...args) => Array.from(monitors).filter(m => m.events.includes(event)).forEach(monitor => monitor.func.call(monitor.module, ...args));