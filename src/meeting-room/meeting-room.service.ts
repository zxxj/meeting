import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private repository: Repository<MeetingRoom>;

  async find(
    pageNum: number,
    pageSize: number,
    name: string,
    capacity: number,
    location: string,
    equipment: string,
    description: string,
  ) {
    if (pageNum < 1) {
      throw new BadRequestException('页码不能小于1');
    }

    const skipCount = (pageNum - 1) * pageSize;

    // 模糊查询
    const condition: Record<string, any> = {};

    if (name) {
      condition.name = Like(`%${name}%`);
    }

    if (capacity) {
      condition.capacity = Like(`%${capacity}%`);
    }

    if (location) {
      condition.location = Like(`%${location}%`);
    }

    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }

    if (description) {
      condition.description = Like(`%${description}%`);
    }

    const [meetingRooms, totalCount] = await this.repository.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: condition,
    });

    return {
      meetingRooms,
      totalCount,
    };
  }

  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.repository.findOneBy({
      name: meetingRoomDto.name,
    });

    if (room) {
      throw new BadRequestException('会议室名字已存在!');
    }

    await this.repository.save(meetingRoomDto);

    return '会议室创建成功!';
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    const room = await this.repository.findOneBy({
      id: meetingRoomDto.id,
    });

    if (!room) {
      throw new BadRequestException('会议室不存在!');
    }

    room.name = meetingRoomDto.name;
    room.capacity = meetingRoomDto.capacity;
    room.location = meetingRoomDto.location;

    if (meetingRoomDto.equipment) {
      room.equipment = meetingRoomDto.equipment;
    }

    if (meetingRoomDto.description) {
      room.description = meetingRoomDto.description;
    }

    await this.repository.update(
      {
        id: meetingRoomDto.id,
      },
      room,
    );

    return '更新成功!';
  }

  async findById(id: number) {
    const room = await this.repository.findOneBy({
      id,
    });

    return room;
  }

  async delete(id: number) {
    await this.repository.delete(id);

    return '删除成功!';
  }

  initData() {
    const room1 = new MeetingRoom();
    room1.name = '第一会客室';
    room1.capacity = 10;
    room1.equipment = '黑板,显示器';
    room1.location = '右手第一间';

    const room2 = new MeetingRoom();
    room2.name = '第二会客室';
    room2.capacity = 20;
    room2.equipment = '桌子,椅子';
    room2.location = '右手第二间';

    const room3 = new MeetingRoom();
    room3.name = '第三会客室';
    room3.capacity = 30;
    room3.equipment = '红木家具';
    room3.location = '右手第三间';

    this.repository.insert([room1, room2, room3]);
  }
}
