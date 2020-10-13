import { Entity, BaseEntity, PrimaryColumn, Column } from "typeorm";

@Entity("lockedchannels")
export class LockedChannel extends BaseEntity {
  @PrimaryColumn()
  channelId: string;

  @Column()
  lockedBy: string;

  @Column()
  reason: string;
}