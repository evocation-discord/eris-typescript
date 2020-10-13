import { Module } from "@utils/modules";
import { CronJob } from "cron";

export interface Cron {
    id: string,
    module: Module,
    func: Function,
    cronTime: string | Date,
    cronJob?: CronJob
}