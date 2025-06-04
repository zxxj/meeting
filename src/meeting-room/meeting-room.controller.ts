import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';

@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Get('init')
  init() {
    this.meetingRoomService.initData();
  }

  @Get('list')
  async list(
    @Query('pageNum', new DefaultValuePipe(1)) pageNum: number,
    @Query('pageSize', new DefaultValuePipe(2)) pageSize: number,
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('location') location: string,
    @Query('equipment') equipment: string,
    @Query('description') description: string,
  ) {
    return await this.meetingRoomService.find(
      pageNum,
      pageSize,
      name,
      capacity,
      location,
      equipment,
      description,
    );
  }

  @Post('create')
  async create(@Body() meetingRoomDto: CreateMeetingRoomDto) {
    return this.meetingRoomService.create(meetingRoomDto);
  }

  @Post('update')
  async update(@Body() meetingRoomDto: UpdateMeetingRoomDto) {
    return this.meetingRoomService.update(meetingRoomDto);
  }

  @Get(':id')
  async find(@Param('id') id: number) {
    return this.meetingRoomService.findById(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return this.meetingRoomService.delete(id);
  }
}
