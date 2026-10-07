const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME

export const getAppName = (): string => {
  const appName = `${APP_NAME ? APP_NAME : 'APP_NAME'}`
  return appName
}
