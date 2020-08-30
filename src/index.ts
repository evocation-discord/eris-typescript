
import dotenv from "dotenv";
dotenv.config();

import "module-alias/register";
import "@lib/utils/types/discord";

import EventModule from "@modules/EventModule";
import { ErisClient } from "@lib/utils";
import UtilCommandModule from "@modules/UtilCommands";
import DonationModule from "@modules/DonationModule";
import DirectMessageModule from "@modules/DirectMessageModule";
import ListenerMonitorInit from "@modules/ListenerMonitorInit";
import PermissionsModule from "@modules/PermissionsModule";
import LoggingModule from "@modules/LoggingModule";
import EmojiModule from "@modules/EmojiModule";
import HelpModule from "@modules/HelpModule";
import { setupDatabase } from "@lib/utils/database";
import GiveawayModule from "@modules/GiveawayModule";
import ExclusionsModule from "@modules/ExclusionsModule";
import PurchaseableRolesModule from "@modules/PurchaseableRolesModule";

export const client = new ErisClient({
  botAdmins: [
    "209609796704403456", // Stijn
    "369497100834308106", // Ace
  ],
});

setupDatabase();

client
  .registerModule(ListenerMonitorInit)
  .registerModule(EventModule)
  .registerModule(UtilCommandModule)
  .registerModule(DonationModule)
  .registerModule(DirectMessageModule)
  .registerModule(PermissionsModule)
  .registerModule(LoggingModule)
  .registerModule(EmojiModule)
  .registerModule(HelpModule)
  .registerModule(GiveawayModule)
  .registerModule(ExclusionsModule)
  .registerModule(PurchaseableRolesModule)
  .login(process.env.DISCORD_TOKEN);