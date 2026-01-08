module.exports = {
  apps: [
    {
      name: "michinomicon-dev",
      script: "pnpm",
      args: "start",
      // script: "dist/server.js", // Check your build output location!
      // If using Payload 3.0 with Next.js, use: script: "npm", args: "start"
      env_production: {
        NODE_ENV: "production",
        PAYLOAD_CONFIG_PATH: "dist/payload.config.js"
      },
    },
  ],
};
