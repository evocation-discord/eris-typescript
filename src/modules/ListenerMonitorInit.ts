import { listener, Module, ErisClient, Monitor } from "@lib/utils";
import { ClientEvents } from "discord.js";

export default class ListenerMonitorInit extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @listener({ event: "message" })
  message(...args: unknown[]): void {
    setupMonitor(this.client.monitorManager.monitors, "message", ...args);
    // Array.from(this.client.monitorManager.monitors).filter(m => m.events.includes("message")).forEach(monitor => monitor.func.call(monitor.module, ...args));
  }

  @listener({ event: "messageUpdate" })
  messageUpdate(...args: unknown[]): void {
    setupMonitor(this.client.monitorManager.monitors, "messageUpdate", ...args);
    // Array.from(this.client.monitorManager.monitors).filter(m => m.events.includes("messageUpdate")).forEach(monitor => monitor.func.call(monitor.module, ...args));
  }

  @listener({ event: "messageDelete" })
  messageDelete(...args: unknown[]): void {
    setupMonitor(this.client.monitorManager.monitors, "messageDelete", ...args);
    // Array.from(this.client.monitorManager.monitors).filter(m => m.events.includes("messageDelete")).forEach(monitor => monitor.func.call(monitor.module, ...args));
  }

  @listener({ event: "messageReactionAdd" })
  messageReactionAdd(...args: unknown[]): void {
    setupMonitor(this.client.monitorManager.monitors, "messageReactionAdd", ...args);
    // Array.from(this.client.monitorManager.monitors).filter(m => m.events.includes("messageReactionAdd")).forEach(monitor => monitor.func.call(monitor.module, ...args));
  }
}

const setupMonitor = (monitors: Set<Monitor>, event: keyof ClientEvents, ...args) => Array.from(monitors).filter(m => m.events.includes(event)).forEach(monitor => monitor.func.call(monitor.module, ...args));