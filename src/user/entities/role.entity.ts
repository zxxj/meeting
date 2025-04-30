import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Length } from 'class-validator';
import { Permission } from './permission.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Length(1, 20)
  @Column({
    length: 20,
    comment: '角色名',
  })
  name: string;

  @JoinTable({ name: 'role_permissions' })
  @ManyToMany(() => Permission)
  permissions: Permission[];
}
