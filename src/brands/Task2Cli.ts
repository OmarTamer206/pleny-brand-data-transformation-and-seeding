import { Injectable } from '@nestjs/common';
import { TaskCliInterface } from 'src/interfaces/TaskCli.interface';
import { BrandModel } from './schema/brands-schema';
import { faker } from '@faker-js/faker';
import { Workbook } from 'exceljs';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class Task2Cli implements TaskCliInterface {
  // This function handles the CLI menu and its functionalities

  async run() {
    console.log(
      '===================================================================================================',
    );
    console.log(
      '\n --- Seeding 10 new VALID brand documents using Faker.js --- \n',
    );

    // Array to hold the generated seed data with the case note for each (Excel only as it wasn't part of the schema)

    const seedData: {
      brandName: string;
      yearFounded: number;
      headquarters: string;
      numberOfLocations: number;
      caseNote: string;
    }[] = [];

    // Making 10 different valid brand documents

    for (let i = 0; i < 10; i++) {
      let brandName = faker.company.name();
      let yearFounded = faker.number.int({
        min: 1600,
        max: new Date().getFullYear(),
      });
      let headquarters =
        faker.location.city() + ', ' + faker.location.country();
      let numberOfLocations = faker.number.int({ min: 1, max: 5000 });
      let caseNote = 'Standard valid brand';

      // Case notes for each of the 10 new brand documents

      switch (i) {
        case 0:
          caseNote = 'Standard global corporation';
          break;
        case 1:
          yearFounded = 2023;
          caseNote = 'Newly established brand (modern startup)';
          break;
        case 2:
          yearFounded = 1950;
          numberOfLocations = 5;
          caseNote = 'Mid-20th century brand with small presence';
          break;
        case 3:
          numberOfLocations = 3000;
          caseNote = 'High-growth international chain';
          break;
        case 4:
          brandName = brandName.toUpperCase();
          caseNote = 'Brand name styled in uppercase (marketing emphasis)';
          break;
        case 5:
          brandName = brandName + ' & Sons';
          caseNote = 'Family-owned traditional brand';
          break;
        case 6:
          headquarters = 'Remote / Virtual HQ';
          caseNote = 'Fully remote digital-first brand';
          break;
        case 7:
          brandName = faker.word.noun() + ' Industries';
          caseNote = 'Generic industrial-style brand naming';
          break;
        case 8:
          yearFounded = 1900;
          caseNote = 'Legacy heritage brand (founded at minimum valid year)';
          break;
        case 9:
          brandName = faker.company.name() + ' International Group';
          caseNote = 'Global expansion brand with strong identity';
          break;
      }

      // Add the generated document to the seed data array

      seedData.push({
        brandName,
        yearFounded,
        headquarters,
        numberOfLocations,
        caseNote,
      });
    }

    // Insert the 10 seeded records into the database

    try {
      await BrandModel.insertMany(seedData, { ordered: true });
      console.log(
        ' - Successfully inserted 10 valid seed documents into MongoDB',
      );
    } catch (error) {
      console.error(
        ` !!! MongoDB Insert Error: ${(error as Error).message} !!! `,
      );
    }

    // Initiating the Excel workbook creation

    const workbook = new Workbook();
    const sheet = workbook.addWorksheet('Seeded Brands');

    // Defining columns of the Excel sheet

    sheet.columns = [
      { header: 'Brand Name', key: 'brandName', width: 50 },
      { header: 'Year Founded', key: 'yearFounded', width: 35 },
      { header: 'Headquarters', key: 'headquarters', width: 50 },
      { header: 'Number of Locations', key: 'numberOfLocations', width: 40 },
      { header: 'Case Note', key: 'caseNote', width: 70 },
    ];

    // Fetch existing documents

    const existingDocs = await BrandModel.find().lean().exec();

    // mapping the database array into the Excel column keys and assign default value of caseNote for existing documents

    const existingEntries = existingDocs.map((doc) => ({
      brandName: doc.brandName,
      yearFounded: doc.yearFounded,
      headquarters: doc.headquarters,
      numberOfLocations: doc.numberOfLocations,
      caseNote: 'Existing record (no note)', // Placeholder as the new schema didn't state saving the caseNote
    }));

    // Add both existing and new rows (in case there was no existing records, still the seeded ones will be added)

    sheet.addRows([...existingEntries, ...seedData]);

    // Write the Excel file to a unique path (to avoid overwriting)

    const filePath = await this.getUniqueFilePath('seeded-brands', 'csv');

    // Save Excel

    await workbook.csv.writeFile(filePath);
    console.log(` - Excel export complete → ${filePath}`);

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
