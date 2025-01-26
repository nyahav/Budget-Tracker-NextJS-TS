module.exports = {
    apps: [
      {
        name: "budget-tracker", // Application name
        script: "npm", // Script to run
        args: "start", // Arguments passed to the script
        env: {
          NODE_ENV: "development", // Set environment variables
        },
      },
    ],
  };
  