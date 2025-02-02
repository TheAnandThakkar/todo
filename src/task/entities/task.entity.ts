import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDate,
  IsNumber,
} from 'class-validator';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @Column({ type: 'text' })
  @IsString()
  @IsOptional()
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  @IsEnum(TaskStatus, { message: 'Invalid status value' })
  status: TaskStatus;

  @Column({ type: 'timestamp' })
  @IsDate()
  dueDate: Date;

  @Column({ type: 'int' })
  @IsNumber()
  userId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
