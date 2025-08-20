#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadRedirectsFile(filename) {
  const filePath = path.join(__dirname, '..', 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const redirects = {
  ...loadRedirectsFile('internal-oss-tools.json'),
  ...loadRedirectsFile('legacy-websites.json'),
  ...loadRedirectsFile('apps.json'),
  ...loadRedirectsFile('appearances.json'),
  ...loadRedirectsFile('content.json'),
};

const outputPath = path.join(__dirname, '..', 'redirects.json');
fs.writeFileSync(outputPath, JSON.stringify(redirects, null, 2) + '\n');

console.log(`✅ Generated redirects.json with ${Object.keys(redirects).length} redirects\n`);