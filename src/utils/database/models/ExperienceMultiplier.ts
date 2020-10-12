import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("xpmultiplier")
export class XPMultiplier extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: "user" | "server" | "role" | "channel";

  @Column({ nullable: true })
  thingID: Snowflake;

  @Column()
  multiplier: number;

  @Column({ nullable: true })
  endDate?: Date;
}