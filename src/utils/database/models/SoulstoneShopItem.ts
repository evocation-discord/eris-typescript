import {
  Entity, BaseEntity, Column, PrimaryColumn
} from "typeorm";

@Entity("soulstoneshopitem")
export class SoulstoneShopItem extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  type: string;

  @Column()
  data: string;

  @Column({ default: 0 })
  cost: number;
}
