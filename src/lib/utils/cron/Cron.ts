import { Module } from "../modules/Module";
import { Job } from "node-schedule";

export interface Cron {
    id: string,
    module: Module,
    func: Function,
    cronTime: string | Date,
    cronJob?: Job
}