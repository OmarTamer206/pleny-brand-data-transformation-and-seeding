import { Module } from '@nestjs/common';
import { Task1Cli } from './Task1Cli';
import { Task2Cli } from './Task2Cli';
import { Task3Cli } from './Task3Cli';

@Module({
  providers: [Task1Cli, Task2Cli, Task3Cli],
  exports: [Task1Cli, Task2Cli, Task3Cli],
})
export class BrandsModule {}
