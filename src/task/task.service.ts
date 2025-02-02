import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/task.dto';
import { UpdateTaskDto } from './dto/update.task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async getAllTasks(req: Request, res: Response) {
    try {
      const userId = req['user'].id;
      const tasks = await this.taskRepository.find({ where: { userId } });
      return res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getTaskById(id: number, req: Request, res: Response) {
    try {
      const userId = req['user'].id;
      const task = await this.taskRepository.findOne({ where: { id, userId } });
      if (!task) {
        return res
          .status(404)
          .json({ success: false, message: `Task with ID ${id} not found` });
      }
      return res.status(200).json({ success: true, data: task });
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async createTask(createTaskDto: CreateTaskDto, req: Request, res: Response) {
    try {
      const userId = req['user'].id;
      const task = this.taskRepository.create({ ...createTaskDto, userId });
      const savedTask = await this.taskRepository.save(task);
      return res.status(201).json({ success: true, data: savedTask });
    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async updateTask(
    id: number,
    updateTaskDto: UpdateTaskDto,
    req: Request,
    res: Response,
  ) {
    try {
      const userId = req['user'].id;
      const existingTask = await this.taskRepository.findOne({
        where: { id, userId },
      });
      if (!existingTask) {
        return res
          .status(404)
          .json({ success: false, message: `Task with ID ${id} not found` });
      }
      await this.taskRepository.update(id, updateTaskDto);
      const updatedTask = await this.taskRepository.findOne({ where: { id } });

      return res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
      console.error(`Error updating task with ID ${id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async deleteTask(id: number, req: Request, res: Response) {
    try {
      const userId = req['user'].id;
      const existingTask = await this.taskRepository.findOne({
        where: { id, userId },
      });
      if (!existingTask) {
        return res
          .status(404)
          .json({ success: false, message: `Task with ID ${id} not found` });
      }
      const result = await this.taskRepository.delete(id);
      if (result.affected === 0) {
        return res
          .status(404)
          .json({ success: false, message: `Task with ID ${id} not found` });
      }
      return res.status(200).json({
        success: true,
        message: `Task with ID ${id} deleted successfully`,
      });
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
