import { ErisClient } from "@utils/client";
import { Cron } from "./Cron";
import { CronJob } from "cron";

export class CronManager {
  crons: Set<Cron> = new Set();
  constructor(public client: ErisClient) { }

  add(cron: Cron): void {
    if (this.crons.has(cron)) return;

    const conflictingCron = Array.from(this.crons).find(
      l => l.id === cron.id
    );
    if (conflictingCron) {
      throw new Error(
        `Cannot add ${cron.id} because it would conflict with ${conflictingCron.id}.`
      );
    }
    cron.cronJob = new CronJob(cron.cronTime, cron.func.apply(cron.module), null, true, null, null, false);
    this.crons.add(cron);
  }

  remove(cron: Cron): void {
    this.crons.delete(cron);
  }

  getById(id: string): Cron | undefined {
    return Array.from(this.crons).find(c => c.id === id);
  }
}