const APP_NAME = process.env.APP_NAME

export const getAppName = (): string => {
  const appName = `${APP_NAME ? APP_NAME : 'APP_NAME'}`
  return appName
}
