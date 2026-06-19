const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const envPath = path.join(__dirname, "../src/environments/environment.ts");
const prodEnvPath = path.join(__dirname, "../src/environments/environment.prod.ts");

// Fallback values or let them be undefined if not set in .env
const publicKey = process.env.EMAILJS_PUBLIC_KEY || '';
const serviceId = process.env.EMAILJS_SERVICE_ID || '';
const templateId = process.env.EMAILJS_TEMPLATE_ID || '';

// Development environment
const devEnv = `export const environment = {
 production: false,
  emailjs: {
    publicKey: '${publicKey}',
    serviceId: '${serviceId}',
    templateId: '${templateId}',
  }
};
`;

// Production environment
const prodEnv = `export const environment = {
 production: true,
  emailjs: {
    publicKey: '${publicKey}',
    serviceId: '${serviceId}',
    templateId: '${templateId}',
  }
};
`;

// Ensure directory exists
const envDir = path.dirname(envPath);
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Always generate both files (Angular needs both for fileReplacements)
fs.writeFileSync(envPath, devEnv);
fs.writeFileSync(prodEnvPath, prodEnv);
console.log("Environment files generated from .env");
