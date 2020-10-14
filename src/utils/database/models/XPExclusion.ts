import {
  Entity, BaseEntity, Column, PrimaryColumn
} from "typeorm";

@Entity("xpexclusions")
export class XPExclusion extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column("text")
  type: "role" | "channel" | "category";
}
