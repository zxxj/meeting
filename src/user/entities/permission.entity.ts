import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Length } from 'class-validator';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Length(1, 20)
  @Column({
    length: 20,
    comment: '权限代码',
  })
  code: string;

  @Length(1, 100)
  @Column({
    length: 100,
    comment: '权限描述',
  })
  description: string;
}
