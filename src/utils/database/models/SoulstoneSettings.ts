import {
  Entity, BaseEntity, Column, PrimaryColumn
} from "typeorm";

@Entity("soulstonesettings")
export class SoulstoneSettings extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: "spawn_commonality", default: 0.05, type: "float" })
  spawnCommonality: number;

  @Column({ name: "lower_emergence", default: 5 })
  lowerEmergence: number;

  @Column({ name: "higher_emergence", default: 21 })
  higherEmergence: number;
}
