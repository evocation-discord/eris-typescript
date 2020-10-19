import {
  Entity, BaseEntity, Column, PrimaryGeneratedColumn
} from "typeorm";

@Entity("soulstonechannels")
export class SoulstoneGenerationChannel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channel: string;
}
