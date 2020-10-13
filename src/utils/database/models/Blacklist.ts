import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("blacklists")
export class Blacklist extends BaseEntity {
  @PrimaryColumn()
  id: Snowflake;

  @Column("text")
  type: "user" | "role";
}