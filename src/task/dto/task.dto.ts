import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsNotEmpty,
} from 'class-validator';
import { TaskStatus } from '../entities/task.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus, { message: 'Invalid status' })
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty({ message: 'Due date is required' })
  dueDate: Date;
}
