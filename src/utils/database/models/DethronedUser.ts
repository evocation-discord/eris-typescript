import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("dethronedusers")
export class DethronedUser extends BaseEntity {
  @PrimaryColumn()
  id: Snowflake;

  @Column("simple-array")
  roles: Snowflake[];
}