#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Recursively find all .js files in a directory
function findJsFiles(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.resolve(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      results = results.concat(findJsFiles(filePath));
    } else if (/\.js$/.test(file)) {
      results.push(filePath);
    }
  }
  return results;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Match ESM imports: import ... from '...' | "..." | `...`
  const regex = /from\s+(['"`])(.*?)\1/g;
  let newContent = '';
  let lastIndex = 0;

  for (const match of content.matchAll(regex)) {
    const [fullMatch, quote, importPath] = match;
    const start = match.index;
    const end = start + fullMatch.length;

    // Append content before this match
    newContent += content.slice(lastIndex, start);

    // Skip non-relative paths
    if (!importPath.startsWith('.') && !importPath.startsWith('..')) {
      newContent += fullMatch;
      lastIndex = end;
      continue;
    }

    // Skip if already has a known extension (user specifically said .js, but I'll include common ones)
    if (/\.(js|ts|mjs|cjs)$/.test(importPath)) {
      newContent += fullMatch;
      lastIndex = end;
      continue;
    }

    const baseDir = path.dirname(filePath);
    const resolvedDir = path.resolve(baseDir, importPath);

    try {
      const stats = fs.statSync(resolvedDir);
      let resolvedImport = importPath;

      if (stats.isDirectory()) {
        // Directory import: add /index.ts if it exists
        const indexPath = path.join(resolvedDir, 'index.ts');
        if (fs.existsSync(indexPath)) {
          resolvedImport = `${importPath}/index.ts`;
        }
      } else if (stats.isFile()) {
        // File import without extension: add .ts
        const tsFile = resolvedDir + '.ts';
        if (fs.existsSync(tsFile)) {
          resolvedImport = `${importPath}.ts`;
        }
        // File import without extension: add .ts
        const jsFile = resolvedDir + '.js';
        if (fs.existsSync(jsFile)) {
          resolvedImport = `${importPath}.js`;
        }
      }

      newContent += `from ${quote}${resolvedImport}${quote}`;
    } catch (err) {
      console.trace(err);
      let resolvedImport = importPath;
      // Path doesn't exist, leave as is
      // newContent += fullMatch;
      // File import without extension: add .ts
      if (fs.existsSync(resolvedDir + '.ts')) {
        resolvedImport = `${importPath}.ts`;
      }
      // File import without extension: add .ts
      else if (fs.existsSync(resolvedDir + '.js')) {
        resolvedImport = `${importPath}.js`;
      }
      else {
        console.log('Something else')
      }
      newContent += `from ${quote}${resolvedImport}${quote}`;
    }

    lastIndex = end;
  }
  newContent += content.slice(lastIndex);

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Processed: ${filePath}`);
}

const targetDir = process.argv[2] || '.';
findJsFiles(targetDir).forEach(processFile);