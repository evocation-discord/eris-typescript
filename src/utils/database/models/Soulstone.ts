import {
  Entity, BaseEntity, Column, PrimaryColumn
} from "typeorm";

@Entity("soulstones")
export class Soulstone extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ default: 0 })
  soulstones: number;
}
