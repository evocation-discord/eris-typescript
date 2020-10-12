import { Entity, BaseEntity, PrimaryColumn, Column } from "typeorm";

@Entity("disabledcommands")
export class DisabledCommand extends BaseEntity {
  @PrimaryColumn()
  commandName: string;

  @Column()
  disabledBy: string;
}