import { ErisClient } from "@utils/client";
import { Monitor } from "./Monitor";

export class MonitorManager {
  monitors: Set<Monitor> = new Set();

  constructor(public client: ErisClient) { }

  add(monitor: Monitor): void {
    if (this.monitors.has(monitor)) return;

    const conflictingMonitor = [...this.monitors].find(
      (l) => l.id === monitor.id
    );
    if (conflictingMonitor) {
      throw new Error(
        `Cannot add ${monitor.id} because it would conflict with ${conflictingMonitor.id}.`
      );
    }
    this.monitors.add(monitor);
  }

  remove(monitor: Monitor): void {
    this.monitors.delete(monitor);
  }

  getById(id: string): Monitor | undefined {
    return [...this.monitors].find((c) => c.id === id);
  }
}
