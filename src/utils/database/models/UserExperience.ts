import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("userexperiences")
export class UserXP extends BaseEntity {
  @PrimaryColumn()
  id: Snowflake;

  @Column({ default: 0 })
  xp: number;
}