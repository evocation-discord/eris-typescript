import { ErisClient } from "../client/ErisClient";

declare module "discord.js" {
  interface Message {
    client: ErisClient;
  }
}