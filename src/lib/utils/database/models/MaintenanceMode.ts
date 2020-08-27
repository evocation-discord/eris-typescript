import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Snowflake } from "discord.js";

@Entity("maintenance")
export class MaintenanceMode extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  enabledBy: Snowflake;
}