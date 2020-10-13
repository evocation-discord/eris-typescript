import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";

@Entity("dethronedusers")
export class DethronedUser extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column("simple-array")
  roles: string[];
}