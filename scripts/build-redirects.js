#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadRedirectsFile(filename) {
  const filePath = path.join(__dirname, '..', 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const files = [
  'internal-oss-tools.json',
  'legacy-websites.json',
  'apps.json',
  'appearances.json',
  'content.json',
  'dev-logs.json'
];

const redirectSections = files.map(filename => ({
  filename,
  data: loadRedirectsFile(filename)
}));

const keyToFiles = new Map();

for (const section of redirectSections) {
  for (const key of Object.keys(section.data)) {
    if (!keyToFiles.has(key)) {
      keyToFiles.set(key, []);
    }
    keyToFiles.get(key).push(section.filename);
  }
}

const duplicates = [];
for (const [key, files] of keyToFiles) {
  if (files.length > 1) {
    duplicates.push({ key, files });
  }
}

if (duplicates.length > 0) {
  console.error('❌ Duplicate keys found:');
  for (const duplicate of duplicates) {
    console.error(`  "${duplicate.key}" appears in: ${duplicate.files.join(', ')}\n`);
  }
  process.exit(1);
}

const redirects = {};
for (const section of redirectSections) {
  Object.assign(redirects, section.data);
}

const outputPath = path.join(__dirname, '..', 'redirects.json');
fs.writeFileSync(outputPath, JSON.stringify(redirects, null, 2) + '\n');

console.log(`✅ Generated redirects.json with ${Object.keys(redirects).length} redirects\n`);