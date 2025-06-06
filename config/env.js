const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env first (if it exists)
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

// Load .env.local second (if it exists), will override .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath, override: true });
}

// If neither file exists, just rely on machine environment variables (process.env)

console.log('Environment variables loaded');
