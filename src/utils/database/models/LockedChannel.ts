import { Entity, BaseEntity, PrimaryColumn, Column } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("lockedchannels")
export class LockedChannel extends BaseEntity {
  @PrimaryColumn()
  channelId: Snowflake;

  @Column()
  lockedBy: Snowflake;

  @Column()
  reason: string;
}