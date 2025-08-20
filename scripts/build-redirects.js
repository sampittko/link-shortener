#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Helper function to load JSON file
function loadRedirectsFile(filename) {
  const filePath = path.join(__dirname, '..', 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Load all redirect categories from JSON files
const githubProjects = loadRedirectsFile('github-projects.json');
const websiteVersions = loadRedirectsFile('website-versions.json');
const legacyManifesto = loadRedirectsFile('legacy-manifesto.json');
const appLinks = loadRedirectsFile('app-links.json');
const appearances = loadRedirectsFile('appearances.json');
const content = loadRedirectsFile('content.json');

// Combine all sections into the final redirects object
const redirects = {
  ...githubProjects,

  ...websiteVersions,

  ...legacyManifesto,

  ...appLinks,

  ...appearances,

  ...content,
};

// Write to redirects.json
const outputPath = path.join(__dirname, '..', 'redirects.json');
fs.writeFileSync(outputPath, JSON.stringify(redirects, null, 2) + '\n');

console.log(`✅ Generated redirects.json with ${Object.keys(redirects).length} redirects\n`);