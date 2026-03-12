declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URI: string
      PAYLOAD_MEDIA_DIR: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      DEFAULT_COLOR_THEME: string
      APP_NAME: string
      APP_ENV: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
