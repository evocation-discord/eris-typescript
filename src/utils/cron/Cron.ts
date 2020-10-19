import { Job } from "node-schedule";
import { Module } from "../modules";

export interface Cron {
    id: string,
    module: Module,
    func: (...args: unknown[]) => unknown,
    cronTime: string | Date,
    cronJob?: Job
}
