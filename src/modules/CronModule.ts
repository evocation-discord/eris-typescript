import { cron, Module, ErisClient } from "@lib/utils";

export default class CronModule extends Module {
  constructor(client: ErisClient) {
    super(client);
  }
}