const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  apps: [
    {
      name: "emi-api",
      script: "server.js",
      cwd: "/home/el/app/emi/backend/build/bin",
      env: {
        NODE_ENV: "production",
        ...process.env
      }
    }
  ]
};
