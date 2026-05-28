module.exports = {
        apps: [
          {
            name: "emi-api",
            script: "bin/server.js",
            cwd: "/home/el/app/emi/backend/build",
            env: {
              NODE_ENV: "production"
            }
          }
        ]
      };
