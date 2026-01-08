module.exports = {
  apps: [
    {
      name: "michinomicon-dev",
      // script: "dist/server.js",
      script: "node", args: ".next/standalone/server.js",
      // If using Payload 3.0 with Next.js, use: script: "npm", args: "start"
      env_production: {
        NODE_ENV: "production",
        PAYLOAD_CONFIG_PATH: "dist/payload.config.js"
      },
    },
  ],
};
