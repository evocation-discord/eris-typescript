import {
  Entity, BaseEntity, Column, PrimaryColumn
} from "typeorm";

@Entity("blacklists")
export class Blacklist extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column("text")
  type: "user" | "role";
}
