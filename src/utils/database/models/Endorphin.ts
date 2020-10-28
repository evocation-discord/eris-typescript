import {
  Entity, BaseEntity, Column, PrimaryColumn
} from "typeorm";

@Entity("endorphins")
export class Endorphin extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ default: 0 })
  endorphins: number;
}
