export * from "./colors";
export * from "./emotes";
export * from "./env";

// eslint-disable-next-line no-useless-escape
export const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
export const messageLinkRegex = /^(?:https?):\/\/(?:(?:(?:canary|ptb)\.)?(?:discord|discordapp)\.com\/channels\/)(@me|\d+)\/(\d+)\/(\d+)$/g;

export enum CommandCategories {
  "Bot Owner" = "Bot Owner",
  "Informational" = "Informational",
  "Giveaways" = "Giveaways",
  "Server Administrator" = "Server Administrator",
  "Moderation" = "Moderation",
  "Purchasable Role Limitation" = "Purchasable Role Limitation"
}

export const levelConstants = {
  getLevelXP(n: number): number {
    return 5 * (n ** 2) + 50 * n + 100;
  },
  getLevelFromXP(xp: number): number {
    let remaining_xp = xp;
    let level = 0;
    while (remaining_xp >= levelConstants.getLevelXP(level)) {
      remaining_xp -= levelConstants.getLevelXP(level);
      level += 1;
    }
    return level;
  }
};