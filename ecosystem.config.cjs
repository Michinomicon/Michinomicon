module.exports = {
  apps: [
    {
      name: 'michinomicon',
      script: 'server.js', // Standalone entry point
      //Force PM2 to read the .env file in the current directory
      env_file: '.env',
      env_production: {
        NODE_ENV: 'production',
        PAYLOAD_CONFIG_PATH: 'src/payload.config.ts',
      },
      // Error handling and log settings
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      // Memory management: restart if it exceeds 400MB (adjust based on VPS specs)
      max_memory_restart: '800M',
    },
  ],
}

// module.exports = {
//   apps: [
//     {
//       name: "michinomicon",
//       script: "pnpm",
//       args: "start",
//       interpreter: "none",
//       // Force PM2 to read the .env file in the current directory
//       env_file: '.env',
//       env_production: {
//         NODE_ENV: "production",
//         PAYLOAD_CONFIG_PATH: "src/payload.config.ts",
//       },
//     },
//   ],
// };
