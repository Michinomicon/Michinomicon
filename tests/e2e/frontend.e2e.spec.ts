import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let _page: Page
  const appName = process.env.NEXT_PUBLIC_APP_NAME

  test.beforeAll(async ({ browser }, _testInfo) => {
    const context = await browser.newContext()
    _page = await context.newPage()
  })

  test(`Homepage renders with configured app title: '${appName}'`, async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(new RegExp(`.*${appName}`))

    const appLogoText = page.locator('header .app-logo .app-logo-text').first()

    await expect(appLogoText).toBeAttached()
    await expect(appLogoText).toBeVisible()
    await expect(appLogoText).toContainText(appName)
  })

  test('Admin login screen renders with admin login form', async ({ page }) => {
    await page.goto('http://localhost:3000/admin')

    const emailInput = page.locator('form.login__form input#field-email').first()
    await expect(emailInput).toBeAttached()
    await expect(emailInput).toBeVisible()

    const passwordInput = page.locator('form.login__form input#field-password').first()
    await expect(passwordInput).toBeAttached()
    await expect(passwordInput).toBeVisible()
  })
})
