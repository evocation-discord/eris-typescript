import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("levelroles")
export class LevelRole extends BaseEntity {
  @PrimaryColumn()
  id: Snowflake;

  @Column()
  level: number;
}