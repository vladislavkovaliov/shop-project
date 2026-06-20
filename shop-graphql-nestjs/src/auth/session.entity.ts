import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('session')
export class Session {
  @PrimaryColumn()
  token: string;

  @Column('text')
  userId: string;

  @Column('timestamp')
  expiresAt: Date;
}
