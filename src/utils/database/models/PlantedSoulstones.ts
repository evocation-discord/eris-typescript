import {
  Entity, BaseEntity, Column, PrimaryGeneratedColumn
} from "typeorm";

@Entity("plantedsoulstones")
export class PlantedSoulstones extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  soulstones: number;

  @Column()
  code: string;

  @Column()
  message: string;

  @Column()
  channel: string;
}
