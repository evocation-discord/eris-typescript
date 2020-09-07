import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("xpexclusions")
export class XPExclusion extends BaseEntity {
  @PrimaryColumn()
  id: Snowflake;

  @Column()
  type: "role" | "channel";
}