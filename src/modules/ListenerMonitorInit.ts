import { listener, Module, ErisClient } from "@lib/utils";

export default class ListenerMonitorInit extends Module {
  constructor(client: ErisClient) {
    super(client);
  }

  @listener({ event: "message" })
  message(...args: unknown[]): void {
    Array.from(this.client.monitorManager.monitors).filter(m => m.events.includes("message")).forEach(monitor => monitor.func.call(monitor.module, ...args));
  }

  @listener({ event: "messageUpdate" })
  messageUpdate(...args: unknown[]): void {
    Array.from(this.client.monitorManager.monitors).filter(m => m.events.includes("messageUpdate")).forEach(monitor => monitor.func.call(monitor.module, ...args));
  }

  @listener({ event: "messageDelete" })
  messageDelete(...args: unknown[]): void {
    Array.from(this.client.monitorManager.monitors).filter(m => m.events.includes("messageDelete")).forEach(monitor => monitor.func.call(monitor.module, ...args));
  }

  @listener({ event: "messageReactionAdd" })
  messageReactionAdd(...args: unknown[]): void {
    Array.from(this.client.monitorManager.monitors).filter(m => m.events.includes("messageReactionAdd")).forEach(monitor => monitor.func.call(monitor.module, ...args));
  }
}