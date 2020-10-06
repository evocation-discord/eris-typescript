import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("soulstones")
export class Soulstone extends BaseEntity {
  @PrimaryColumn()
  id: Snowflake;

  @Column({ default: 0 })
  soulstones: number;
}