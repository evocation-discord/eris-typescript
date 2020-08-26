export const ROLES = {
  WHITE_HALLOWS: process.env.WHITE_HALLOWS,
  MODERATION: process.env.MODERATION_ROLE,
  ADMINISTRATORS: process.env.ADMINISTRATORS_ROLE
};

export const CHANNELS = {
  DONATION_LOG: process.env.DONATION_LOG,
  DIRECT_MESSAGE_LOG: process.env.DIRECT_MESSAGE_LOG,
  ERIS_LOG: process.env.ERIS_LOG,
  PERIPHERAL_ANNOUNCEMENTS: process.env.PERIPHERAL_ANNOUNCEMENTS,
  MODERATION_LOG: process.env.MODERATION_LOG,
};

export const NEGATIONS = {
  EXPERIENCE: process.env.NEGATION_EXPERIENCE,
  MEDIA: process.env.NEGATION_MEDIA,
  REACTIONS: process.env.NEGATION_REACTIONS,
  ART: process.env.NEGATION_ART,
};

export const DATABASE_INFO = {
  HOST: process.env.DB_HOST,
  DATABASE: process.env.DB_DATABASE,
  USERNAME: process.env.DB_USERNAME,
  PASSWORD: process.env.DB_PASSWORD,
};

export const MAIN_GUILD_ID = process.env.MAIN_GUILD_ID;