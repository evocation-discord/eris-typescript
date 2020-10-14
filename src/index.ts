import "reflect-metadata";

import dotenv from "dotenv";

import "module-alias/register";
import "@utils/types/discord";

import { ErisClient } from "@utils/client";
import { setupDatabase } from "@database/index";
import ListenerMonitorInit from "@modules/Init/ListenerMonitorInit";
import EventModule from "@modules/Init/EventModule";
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
import UtilModule from "@modules/UtilModule";
import LevelModule from "@modules/Levels/LevelModule";
import ModerationModule from "@modules/Staff/ModerationModule";
import AffiliateModule from "@modules/Staff/AffiliateModule";
import RoleManagementModule from "@modules/ServerAdministrator/RoleManagementModule";
import HalloweenModule from "@modules/HalloweenModule";

dotenv.config();

export const client = new ErisClient({
  botAdmins: [
    "209609796704403456", // Stijn
    "369497100834308106" // Ace
  ]
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
  .registerModule(RoleManagementModule)
  // Staff Modules
  .registerModule(PermissionsModule)
  .registerModule(ModerationModule)
  .registerModule(AffiliateModule)
  // Other Modules
  .registerModule(HelpModule)
  .registerModule(PurchaseableRolesModule)
  .registerModule(UtilModule)
  .registerModule(LevelModule)
  // Event Modules
  .registerModule(HalloweenModule)
  .login(process.env.DISCORD_TOKEN);
