import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("soulstonechannels")
export class SoulstoneGenerationChannel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channel: Snowflake;

}