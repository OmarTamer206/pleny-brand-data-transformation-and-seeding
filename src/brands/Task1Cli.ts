import { Injectable } from '@nestjs/common';
import { BrandModel } from './schema/brands-schema';
import path from 'path';
import * as fs from 'fs/promises';
import * as readline from 'readline/promises';
import { TaskCliInterface } from 'src/interfaces/TaskCli.interface';
import mongoose, { Types } from 'mongoose';

// usage of RawBrand interface is to define the possible fields that each document might have

interface RawBrand {
  _id?: unknown;
  brandName?: string;
  brand?: { name?: string };
  yearFounded?: number | string | null;
  yearCreated?: number | string | null;
  yearsFounded?: number | string | null;
  headquarters?: string;
  hqAddress?: string;
  numberOfLocations?: number | string | null;
}

@Injectable()
export class Task1Cli implements TaskCliInterface {
  // This function handles the CLI menu and its functionalities

  async run(rl: readline.Interface) {
    while (true) {
      console.log(
        '===================================================================================================',
      );
      console.log('\n --- What would you like to do? ---\n');
      console.log('1️ ) Import data from brands.json');
      console.log('2 ) Transform existing documents');
      console.log('0 ) Back\n');

      const choice = await rl.question('Enter your choice (1 or 2 or 0): ');

      if (choice === '1') {
        await this.importInitialData();
      } else if (choice === '2') {
        await this.transformBrands();
      } else if (choice === '0') {
        break;
      } else {
        console.log('!!! Invalid choice. Please select 1, 2, or 0. !!!');
      }
    }
    return;
  }
  // This function is used for getting the data (wrong schema) from the json file and import it into the database

  async importInitialData(): Promise<void> {
    // 1.Get the file path
    const filePath = path.resolve(
      process.cwd(),
      'src',
      'brands',
      'brands.json',
    );
    try {
      // Read and parse the JSON file

      const raw = await fs.readFile(filePath, 'utf-8');
      const json = JSON.parse(raw) as RawBrand[];

      // Normalize the data in which _id is converted to ObjectId

      const normalizedJson = json.map((doc) => {
        let objectId: Types.ObjectId | undefined;

        if (typeof doc._id === 'string') {
          objectId = new Types.ObjectId(doc._id);
        } else if (
          typeof doc._id === 'object' &&
          doc._id !== null &&
          '$oid' in doc._id &&
          typeof (doc._id as { $oid: unknown }).$oid === 'string'
        ) {
          objectId = new Types.ObjectId((doc._id as { $oid: string }).$oid);
        }

        // Return the data (wrong schema) with normalized objectId

        return {
          ...doc,
          _id: objectId,
        };
      });

      // Insert the normalized data into the database (without using the model in order to avoid the schema validation yet to keep the wrong schema)

      await mongoose.connection
        .collection('brands')
        .insertMany(normalizedJson, {
          ordered: false,
        });

      console.log(
        ` - Inserted ${normalizedJson.length} raw documents (that contains mistakes in schema)`,
      );
    } catch (error) {
      console.error(
        ` !!! Failed to import JSON: ${(error as Error).message} !!! `,
      );
    }
  }

  // Function that transforms existing data (wrong schema) to match the new schema (correct schema)

  async transformBrands(): Promise<void> {
    // Fetch all documents with the wrong schema

    const documents = (await BrandModel.find().lean().exec()) as RawBrand[];

    // Stop if there are no documents found

    if (!documents || documents.length === 0) {
      console.log(' - No brand documents found in the database.');
      return;
    }

    // Process each document to transform it to the new schema

    for (const doc of documents) {
      // Prepare the new payload with the new values with the possibility of filling wrong data with default values

      const newPayload = {
        brandName: doc.brandName ?? doc.brand?.name ?? 'Unknown Brand',
        yearFounded: 1600,
        headquarters: doc.headquarters ?? doc.hqAddress ?? 'Unknown HQ Address',
        numberOfLocations: 1,
      };

      // According to the Notes Provided , choosing the other possible fields other than yearFounded , and in worst case it would be the min (1600)

      const rawYear = doc.yearCreated ?? doc.yearsFounded ?? doc.yearFounded;
      const parsedYear = parseInt(String(rawYear), 10);

      // if the parsed year wasn't against the schema rules , make the new yearFounded get its value , otherwise it will keep the default value (1600)

      if (
        !Number.isNaN(parsedYear) &&
        parsedYear >= 1600 &&
        parsedYear <= new Date().getFullYear()
      ) {
        newPayload.yearFounded = parsedYear;
      }

      // if the parsed numberOfLocations wasn't against the schema rules , make the new numberOfLocations get its value , otherwise

      // it will keep the default value (1600)

      const parsedLocations = parseInt(String(doc.numberOfLocations), 10);
      if (!Number.isNaN(parsedLocations) && parsedLocations >= 1) {
        newPayload.numberOfLocations = parsedLocations;
      }

      // replace the old document with the new one (to ensure that any extra fields are removed)

      try {
        await BrandModel.replaceOne({ _id: doc._id }, newPayload);
        console.log(` - Replaced ${String(doc._id)}`);
      } catch (err) {
        console.error(
          ` !!! Error Replaced ${String(doc._id)}: ${(err as Error).message} !!! `,
        );
      }
    }
  }
}
