import {
  Entity, BaseEntity, Column, PrimaryColumn
} from "typeorm";

@Entity("userexperiences")
export class UserXP extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ default: 0 })
  xp: number;
}
