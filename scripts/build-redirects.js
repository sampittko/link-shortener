#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const ALLOWED_PROTOCOL = 'https:';
const ALLOWED_DOMAINS = new Set([
  'github.com',
  'freewith.tech',
  'v1.freewith.tech',
  'v2.freewith.tech',
  'journey.freewith.tech',
  'youtu.be',
  'youtube.com',
  'open.substack.com',
  'testflight.apple.com',
  'producthunt.com',
  'apps.apple.com'
]);

function loadRedirectsFile(filename) {
  const filePath = path.join(dataDir, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const files = fs
  .readdirSync(dataDir)
  .filter((filename) => filename.endsWith('.json') && !filename.startsWith('.'))
  .sort();

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

const invalidDestinations = [];
for (const section of redirectSections) {
  for (const [key, destination] of Object.entries(section.data)) {
    try {
      const destinationUrl = new URL(destination);
      if (destinationUrl.protocol !== ALLOWED_PROTOCOL) {
        invalidDestinations.push(
          `"${key}" in ${section.filename} uses unauthorized protocol: ${destinationUrl.protocol}`
        );
      }
      if (!ALLOWED_DOMAINS.has(destinationUrl.hostname)) {
        invalidDestinations.push(
          `"${key}" in ${section.filename} uses unauthorized domain: ${destinationUrl.hostname}`
        );
      }
    } catch {
      invalidDestinations.push(`"${key}" in ${section.filename} has invalid URL: ${destination}`);
    }
  }
}

if (invalidDestinations.length > 0) {
  console.error('❌ Invalid redirect destinations found:');
  for (const error of invalidDestinations) {
    console.error(`  ${error}`);
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
