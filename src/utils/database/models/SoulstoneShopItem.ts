import {
  Entity, BaseEntity, Column, PrimaryGeneratedColumn
} from "typeorm";

@Entity("soulstoneshopitem")
export class SoulstoneShopItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  type: string;

  @Column()
  data: string;

  @Column({ default: 0 })
  cost: number;
}
