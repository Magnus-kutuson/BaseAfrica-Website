const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const envPath = path.join(__dirname, '../src/environments/environment.ts');
const prodEnvPath = path.join(__dirname, '../src/environments/environment.prod.ts');

const publicKey = process.env.EMAILJS_PUBLIC_KEY;
const serviceId = process.env.EMAILJS_SERVICE_ID;
const templateId = process.env.EMAILJS_TEMPLATE_ID;

if (!publicKey) {
  throw new Error('EMAILJS_PUBLIC_KEY is missing');
}

if (!serviceId) {
  throw new Error('EMAILJS_SERVICE_ID is missing');
}

if (!templateId) {
  throw new Error('EMAILJS_TEMPLATE_ID is missing');
}

const devEnv = `export const environment = {
  production: false,
  publicKey: '${publicKey}',
  serviceId: '${serviceId}',
  templateId: '${templateId}'
};
`;

const prodEnv = `export const environment = {
  production: true,
  publicKey: '${publicKey}',
  serviceId: '${serviceId}',
  templateId: '${templateId}'
};
`;

const envDir = path.dirname(envPath);

if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

fs.writeFileSync(envPath, devEnv, 'utf8');
fs.writeFileSync(prodEnvPath, prodEnv, 'utf8');

console.log('✅ Environment files generated successfully');