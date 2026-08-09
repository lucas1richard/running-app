#!/usr/bin/env node
/**
 * Convert all .js files in a directory (and subdirectories) to .ts
 * 
 * Steps for each file:
 *   1. Update all local import paths from .js → .ts (in the file content)
 *   2. Write the updated content as .ts
 *   3. Delete the original .js file
 * 
 * Usage:
 *   node js-to-ts-converter.js [directory]
 *   Defaults to ./packages/activities-service/src
 */

import { readdir, readFile, writeFile, unlink } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Node's `extname` doesn't work well for .ts in imports, so we use a regex approach
const IMPORT_REGEX = /(['"`])([^'"`]*?)\.js\1/g;

async function findAllJSFiles(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and .git directories
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const subResults = await findAllJSFiles(fullPath);
      results.push(...subResults);
    } else if (entry.isFile() && extname(entry.name) === '.js') {
      results.push(fullPath);
    }
  }

  return results;
}

async function updateImports(content, _filePath) {
  // Replace .js imports with .ts for local files only
  return content.replace(IMPORT_REGEX, (match, quote, importPath) => {
    // Only update local imports (relative paths starting with ./ or ../)
    if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
      return match;
    }

    return `${quote}${importPath.slice(0, -3)}.ts${quote}`;
  });
}

async function convertFile(filePath) {
  const content = await readFile(filePath, 'utf-8');

  // Check if the file has any imports that need updating
  const localImports = content.match(/['"`]\.\/[^'"`]*\.js['"`]/g);
  const parentImports = content.match(/['"`]\.\.\/[^'"`]*\.js['"`]/g);

  let updatedContent = content;

  // Update imports
  // if (localImports || parentImports) {
  //   updatedContent = updateImports(content, filePath);
  // }

  const tsPath = filePath.replace(/\.js$/, '.ts');

  await writeFile(tsPath, updatedContent, 'utf-8');

  // Delete original
  await unlink(filePath);

  return { from: filePath, to: tsPath, contentChanged: updatedContent !== content };
}

async function main() {
  const targetDir = process.argv[2] || join(__dirname, 'src');

  console.log(`Scanning for .js files in: ${targetDir}`);

  const jsFiles = await findAllJSFiles(targetDir);

  if (jsFiles.length === 0) {
    console.log('No .js files found.');
    return;
  }

  console.log(`Found ${jsFiles.length} .js files.\n`);

  let converted = 0;
  let importsUpdated = 0;
  let errors = [];

  for (const filePath of jsFiles) {
    try {
      const result = await convertFile(filePath);

      if (result.contentChanged) {
        importsUpdated++;
      }
      converted++;
    } catch (err) {
      errors.push({ file: filePath, error: err.message });
      console.error(`  ERROR converting ${filePath}: ${err.message}`);
    }
  }

  console.log(`\nConversion complete:`);
  console.log(`  Files converted: ${converted}`);
  console.log(`  Files with imports updated (.js → .ts): ${importsUpdated}`);

  if (errors.length > 0) {
    console.log(`\nErrors (${errors.length}):`);
    for (const err of errors) {
      console.log(`  ${err.file}: ${err.error}`);
    }
  }
}

main().catch(console.error);
