import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, Length } from 'class-validator';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Length(1, 50)
  @Column({
    length: 50,
    comment: '用户名',
  })
  username: string;

  @IsNotEmpty()
  @Length(1, 50)
  @Column({
    length: 50,
    comment: '密码',
  })
  password: string;

  @Length(1, 50)
  @Column({
    length: 50,
    comment: '昵称',
  })
  nickname: string;

  @IsNotEmpty()
  @Length(1, 50)
  @Column({
    length: 50,
    comment: '邮箱',
  })
  email: string;

  @Length(1, 100)
  @Column({
    length: 100,
    comment: '头像',
    nullable: true,
  })
  avatar: string;

  @Length(1, 20)
  @Column({
    length: 20,
    comment: '手机号',
    nullable: true,
  })
  phoneNumber: string;

  @Column({
    comment: '冻结状态 0:未冻结 1:冻结',
    default: false,
  })
  isFrozen: boolean;

  @Column({
    comment: '是否是管理员 0:不是 1:是',
    default: false,
  })
  isAdmin: boolean;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createDate: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateDate: Date;

  @JoinTable({ name: 'user_roles' })
  @ManyToMany(() => Role)
  roles: Role[];
}
