import {
  Entity, BaseEntity, PrimaryGeneratedColumn, Column
} from "typeorm";

@Entity("xpmultiplier")
export class XPMultiplier extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  type: "user" | "server" | "role" | "channel";

  @Column({ nullable: true })
  thingID: string;

  @Column()
  multiplier: number;

  @Column({ nullable: true })
  endDate?: Date;
}
