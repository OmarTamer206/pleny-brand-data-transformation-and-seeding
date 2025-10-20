import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { TaskCliInterface } from 'src/interfaces/TaskCli.interface';
import { BrandModel } from './schema/brands-schema';

@Injectable()
export class Task3Cli implements TaskCliInterface {
  // This function handles the CLI menu and its functionalities

  async run() {
    console.log(
      '===================================================================================================',
    );
    console.log('\n --- Export brands as JSON ---');

    // Gather all brand documents from the database

    const allBrands = await BrandModel.find().lean().exec();

    // If there is no brands , inform the user and exit the function

    if (!allBrands || allBrands.length === 0) {
      console.log(' - No brand documents found in the database.');
      return;
    }
    // Find a unique file path to avoid overwriting existing files

    const outputPath = await this.getUniqueFilePath('exported-brands', 'json');

    // Create a JSON file containing all brands

    await fs.writeFile(outputPath, JSON.stringify(allBrands, null, 2), 'utf8');
    console.log(` - Exported JSON saved → ${outputPath}`);

    return;
  }

  async getUniqueFilePath(
    baseName: string,
    extension: string,
  ): Promise<string> {
    const dir = process.cwd();
    let counter = 0;
    let filePath: string;

    while (true) {
      // forming file name with possible suffix

      const suffix = counter === 0 ? '' : `(${counter})`;
      const fullName = `${baseName}${suffix}.${extension}`;
      filePath = path.resolve(dir, fullName);

      try {
        // if the file exists, increment counter and try again , otherwise break the loop and return the file path

        await fs.access(filePath);
        counter++;
      } catch {
        break;
      }
    }

    return filePath;
  }
}
