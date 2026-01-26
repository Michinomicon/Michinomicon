import { test, expect, Page } from '@playwright/test'

/** TODO
 *
 * Update `playwright.config.ts` with global environment variables that apply to all tests
 */

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(() => {
    process.env.APP_NAME = 'Test Application Name'
  })

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const appName = process.env.APP_NAME
    await expect(page).toHaveTitle(new RegExp(`.*${appName}`))

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText('Payload Website Template')
  })
})
