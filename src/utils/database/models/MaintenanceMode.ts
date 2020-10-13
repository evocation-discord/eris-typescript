import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("maintenance")
export class MaintenanceMode extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  enabledBy: string;
}