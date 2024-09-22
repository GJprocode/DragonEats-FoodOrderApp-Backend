import * as fs from 'fs';
import * as path from 'path';

// Directories to exclude
const excludeDirs = ['dist', 'node_modules', '.git'];

// Function to gather directory structure
const getDirectoryStructure = (dirPath: string): any => {
  const files = fs.readdirSync(dirPath);
  const structure: any = {};

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    // Skip excluded directories
    if (excludeDirs.includes(file)) {
      return;
    }

    // If it's a directory, recursively get its structure
    if (stat.isDirectory()) {
      structure[file] = getDirectoryStructure(filePath);
    } else {
      structure[file] = 'file';
    }
  });

  return structure;
};

// Base directory for the FoodApp folder
const baseDir = path.resolve(__dirname, '../../..');

// Get the directory structure
const directoryStructure = getDirectoryStructure(baseDir);

// Path to save the JSON file
const jsonFilePath = path.resolve(__dirname, './foodAppStructure.json');

// Write the directory structure to a JSON file
fs.writeFileSync(jsonFilePath, JSON.stringify(directoryStructure, null, 2), 'utf-8');

console.log(`Directory structure saved to ${jsonFilePath}`);


// cd C:\Users\gertf\Desktop\FoodApp\backend
// tsx src/utils/printStructure.ts

