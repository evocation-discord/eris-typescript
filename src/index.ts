
import dotenv from "dotenv";
dotenv.config();

import "module-alias/register";
import "@lib/utils/types/discord";

import EventModule from "@modules/Init/EventModule";
import { ErisClient } from "@lib/utils";
import ListenerMonitorInit from "@modules/Init/ListenerMonitorInit";
import { setupDatabase } from "@database/index";
import BotOwner from "@modules/BotOwner/BotOwner";
import DirectMessageModule from "@modules/BotOwner/DirectMessageModule";
import EmojiModule from "@modules/Logging/EmojiModule";
import LoggingModule from "@modules/Logging/LoggingModule";
import DonationModule from "@modules/ServerAdministrator/DonationModule";
import ExclusionsModule from "@modules/ServerAdministrator/ExclusionsModule";
import GiveawayModule from "@modules/ServerAdministrator/GiveawayModule";
import PermissionsModule from "@modules/Staff/PermissionsModule";
import HelpModule from "@modules/HelpModule";
import PurchaseableRolesModule from "@modules/PurchaseableRolesModule";
import UtilCommandModule from "@modules/UtilCommands";
import LevelModule from "@modules/Levels/LevelModule";
import ModerationModule from "@modules/Staff/ModerationModule";

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
  // Bot Owner Modules
  .registerModule(BotOwner)
  .registerModule(DirectMessageModule)
  // Logging Modules
  .registerModule(EmojiModule)
  .registerModule(LoggingModule)
  // Server Administrator Modules
  .registerModule(DonationModule)
  .registerModule(ExclusionsModule)
  .registerModule(GiveawayModule)
  // Staff Modules
  .registerModule(PermissionsModule)
  .registerModule(ModerationModule)
  // Other Modules
  .registerModule(HelpModule)
  .registerModule(PurchaseableRolesModule)
  .registerModule(UtilCommandModule)
  .registerModule(LevelModule)
  .login(process.env.DISCORD_TOKEN);