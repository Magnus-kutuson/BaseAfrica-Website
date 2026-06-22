const fs = require('fs');
const path = require('path');

const envFolder = './src/environments';

// Gather variables from Vercel. If running locally, they will default to empty strings.
const commonFields = `
  publicKey: '${process.env.PUBLIC_KEY || ""}',
  serviceId: '${process.env.SERVICE_ID || ""}',
  templateId: '${process.env.TEMPLATE_ID || ""}',
`;

// Define development file content
const devEnvContent = `export const environment = {
  production: false,${commonFields}};
`;

// Define production file content
const prodEnvContent = `export const environment = {
  production: true,${commonFields}};
`;

// Create the environments folder if it does not exist yet
if (!fs.existsSync(envFolder)) {
  fs.mkdirSync(envFolder, { recursive: true });
}

// Write both files to your environments folder
fs.writeFileSync(path.join(envFolder, 'environment.ts'), devEnvContent);
fs.writeFileSync(path.join(envFolder, 'environment.prod.ts'), prodEnvContent);

console.log('Angular environment files generated successfully!');