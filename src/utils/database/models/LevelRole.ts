import {
  Entity, BaseEntity, Column, PrimaryColumn
} from "typeorm";

@Entity("levelroles")
export class LevelRole extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  level: number;
}
