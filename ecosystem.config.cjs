module.exports = {
  apps: [
    {
      name: "michinomicon-dev",
      interpreter: "none",
      script: "pnpm", 
      args: "start",
      // Force PM2 to read the .env file in the current directory
      env_file: '.env',
      env_production: {
        NODE_ENV: "production",
        PAYLOAD_CONFIG_PATH: "src/payload.config.ts",
        // Email Settings
        SMTP_HOST: "live.smtp.mailtrap.io",
        SMTP_PORT: "587",
        SMTP_USER: "api",
        // SMTP_PASS: mailtrap API key will be loaded from .env
      },
    },
  ],
};
