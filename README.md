# 🏷️ Brand Transformer CLI – Technical Assessment (Task 2)

This repository contains **Task 2** of the technical assessment for the **Software and Data Engineer position at Pleny Software**. The goal is to build a robust **CLI-based data transformation and seeding tool** for a brands collection using **[Nest.js](https://nestjs.com/)**, **MongoDB**, and **Mongoose**.

## 📌 Project Overview

This CLI tool enables:

- Importing and transforming malformed brand data into a clean, normalized schema.
- Seeding the database with diverse valid test brands using Faker Library.
- Exporting the entire collection to a formatted `.json` file.

All features are accessible via an interactive **command-line interface (CLI)** with menu-driven navigation.

## 🛠️ Tech Stack

- **Nest.js + TypeScript** – Modular CLI architecture
- **MongoDB** – NoSQL database for flexible document handling
- **Mongoose** – ODM with schema enforcement
- **Faker.js** – Fake brand data generation
- **ExcelJS** – CSV export of seeded documents
- **Node readline/promises** – CLI interface with user prompts

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/OmarTamer206/pleny-brand-data-transformation-and-seeding.git
cd pleny-brand-data-transformation-and-seeding
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
MONGO_URI=mongodb://localhost:27017/brands
PORT=3000
```
The .env file is excluded from version control for security.

### 4. Running the Application
#### Development
```bash
npm run start
```
#### Watch Mode (Auto Reload)
```bash
npm run start:dev
```
#### Production
```bash
npm run build
npm run start:prod
```
### 5. Menu Options & Functionality
After starting the CLI app, you'll see the following options:

#### 1) Transform Brands (Task 1)
This opens a sub-menu with two key options:
1) Import data from brands.json
    * Reads brands.json from the src/brands/ directory.
    * Accepts malformed or legacy data formats.
    * Parses _id values into ObjectId
    * Inserts all documents into the MongoDB brands collection.
2) Transform existing documents
    * Processes all documents in the brands collection.
    * Normalizes fields to a consistent schema:
    * Ensures valid brandName, yearFounded, headquarters, numberOfLocations.
    * Fills in fallback values if fields are missing.
    * Replaces each document in-place.

#### 2) Seed Brands (Task 2)
* Seeds the database with 10 diverse, schema-adherent test brands using faker.
* Each brand includes: brandName, yearFounded, headquarters, numberOfLocations, caseNote 
* Also fetches all existing documents and includes them in the export.
* Generates a CSV export of both old and new records using exceljs.
* Output file is saved in the project root with a unique name like:
    * seeded-brands.csv
    * seeded-brands(1).csv

#### 3) Export Brands (Task 3)
* Reads all documents from the brands collection.
* Outputs them to a .json file.
* Skips export if the collection is empty.
* Output file is saved in the project root with a unique name like:
    * exported-brands.json
    * exported-brands(1).json

#### 4) Exit Option
* Closes the CLI cleanly
* Disconnects from MongoDB
* Shuts down the Nest.js app context
