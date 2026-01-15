module.exports = {
  apps: [
    {
      name: "michinomicon",
      script: "pnpm", 
      args: "start",
      interpreter: "none", 
      // Force PM2 to read the .env file in the current directory
      env_file: '.env',
      env_production: {
        NODE_ENV: "production",
        PAYLOAD_CONFIG_PATH: "src/payload.config.ts",
      },
    },
  ],
  // Deployment Configuration
  // deploy : {
  //   production : {
  //     //"user" : process.env.SSH_USER,
  //     //"host" : process.env.SSH_HOST,
  //     //"ref"  : "origin/main",
  //     //"repo" : "git@github.com:profile/repo.git",
  //     //"path" : "/var/www/app-name",
  //     //"pre-setup" : "echo 'commands or local script path to be run on the host before the setup process starts'",
  //     //"post-setup": "echo 'commands or a script path to be run on the host after cloning the repo'",
  //     //"pre-deploy" : "pm2 startOrRestart ecosystem.json --env production",
  //     //"post-deploy" : "pm2 startOrRestart ecosystem.json --env production",
  //     //"pre-deploy-local" : "echo 'This is a local executed command'"
  //   }
  // }
};
