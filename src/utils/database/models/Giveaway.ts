import {
  Entity, BaseEntity, PrimaryGeneratedColumn, Column
} from "typeorm";

@Entity("giveaways")
export class Giveaway extends BaseEntity {
  @PrimaryGeneratedColumn({ name: "giveaway_id" })
  id: string;

  @Column()
  duration: number;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column("bigint", { name: "message_id" })
  messageId: string;

  @Column("bigint", { name: "channel_id" })
  channelId: string;

  @Column("boolean", { default: false })
  ended: boolean;

  @Column()
  winners: number;

  @Column("text")
  prize: string;

  @Column("bigint")
  startedBy: string;
}
