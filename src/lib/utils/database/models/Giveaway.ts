import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("giveaways")
export class Giveaway extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "giveaway_id" })
  id: string;

  @Column("int", { name: "end_time", nullable: true })
  duration: number;

  @Column("bigint", { name: "message_id" })
  messageId: string;

  @Column("bigint", { name: "channel_id" })
  channelId: string;

  @Column("boolean", { default: false })
  ended: boolean;

  @Column("simple-array", { default: [] })
  participants: Snowflake[];

  @Column({ nullable: true })
  winner: Snowflake;
}