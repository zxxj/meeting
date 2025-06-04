import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateMeetingRoomDto } from './create-meeting-room.dto';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateMeetingRoomDto extends PartialType(CreateMeetingRoomDto) {
  @ApiProperty()
  @IsNotEmpty({
    message: '会议室ID不能为空!',
  })
  id: number;

  @IsNotEmpty({
    message: '会议室名称不能为空!',
  })
  @MaxLength(50, {
    message: '会议室名称长度限制为50个字符!',
  })
  name: string;

  @IsNotEmpty({
    message: '会议室容量不能为空!',
  })
  capacity: number;

  @IsNotEmpty({
    message: '会议室位置不能为空!',
  })
  @MaxLength(50, {
    message: '会议室位置长度限制为50个字符!',
  })
  location: string;

  @IsNotEmpty({
    message: '设备不能为空!',
  })
  @MaxLength(255, {
    message: '设备长度限制为255个字符!',
  })
  equipment: string;

  @IsNotEmpty({
    message: '描述不能为空!',
  })
  @MaxLength(100, {
    message: '描述长度限制为100个字符!',
  })
  description: string;
}
