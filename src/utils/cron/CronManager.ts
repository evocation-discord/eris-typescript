import schedule from "node-schedule";
import { ErisClient } from "../client/ErisClient";
import { Cron } from "./Cron";

export class CronManager {
  crons: Set<Cron> = new Set();

  constructor(public client: ErisClient) { }

  add(cron: Cron): void {
    if (this.crons.has(cron)) return;

    const conflictingCron = [...this.crons].find(
      (l) => l.id === cron.id
    );
    if (conflictingCron) {
      throw new Error(
        `Cannot add ${cron.id} because it would conflict with ${conflictingCron.id}.`
      );
    }
    cron.cronJob = schedule.scheduleJob(cron.cronTime, cron.func.bind(cron.module));
    this.crons.add(cron);
  }

  remove(cron: Cron): void {
    this.crons.delete(cron);
  }

  getById(id: string): Cron | undefined {
    return [...this.crons].find((c) => c.id === id);
  }
}
