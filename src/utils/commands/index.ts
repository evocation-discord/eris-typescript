import { command } from "./decorator";

enum CommandCategories {
  "Bot Maintainers" = "Bot Maintainers",
  "Informational" = "Informational",
  "Giveaways" = "Giveaways",
  "Server Administrator" = "Server Administrator",
  "Moderation" = "Moderation",
  "Purchasable Role Limitation" = "Purchasable Role Limitation",
  "Levelling System" = "Levelling System",
  "Affiliation Management" = "Affiliation Management"
}

export {
  command,
  CommandCategories
};
