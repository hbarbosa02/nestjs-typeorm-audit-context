import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

// Você pode fazer suas outras entidades estenderem esta classe
// para herdarem automaticamente as colunas de auditoria.
export abstract class Auditable {
  @Column({ type: 'varchar', length: 36, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  updatedBy: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  deletedBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
