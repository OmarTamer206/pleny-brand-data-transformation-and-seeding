import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import mongoose from 'mongoose';
import { TaskCliInterface } from './interfaces/TaskCli.interface';

import * as dotenv from 'dotenv';
import { Task1Cli } from './brands/Task1Cli';
import { Task2Cli } from './brands/Task2Cli';
import { Task3Cli } from './brands/Task3Cli';
dotenv.config();

async function bootstrap(): Promise<void> {
  await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://localhost:27017');
  console.log(` - Connected to MongoDB: ${process.env.MONGO_URI}`);

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error'],
  });

  const rl = readline.createInterface({ input, output });
  while (true) {
    console.log(
      '===================================================================================================',
    );

    console.log('\n --- Brand Management CLI --- ');
    console.log('==========================');
    console.log('1️ ) Task 1 – Transform Brands');
    console.log('2️ ) Task 2 – Seed Brands');
    console.log('3 ) Task 3 – Export Brands');
    console.log('0️ ) Exit\n');

    const choice = (await rl.question(' - Select an option: ')).trim();

    if (choice === '1') {
      const t1 = app.get<TaskCliInterface>(Task1Cli);
      await t1.run(rl);
    } else if (choice === '2') {
      const t2 = app.get<TaskCliInterface>(Task2Cli);
      await t2.run(rl);
    } else if (choice === '3') {
      const t3 = app.get<TaskCliInterface>(Task3Cli);
      await t3.run(rl);
    } else if (choice === '0') {
      break;
    } else {
      console.log(
        ' !!! Invalid choice. Please enter one of the available options. !!! \n',
      );
    }
  }
  // ✅ 2. Disconnect on exit

  await mongoose.disconnect();
  console.log(' - Disconnected from MongoDB.');
  console.log(' - Exiting...');
  await app.close();
  process.exit(0);
}

bootstrap();
