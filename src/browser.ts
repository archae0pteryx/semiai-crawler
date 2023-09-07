import puppeteer, { type Browser, type Page } from "puppeteer"
import { getUserAgent } from "./uas"

export const buildBrowser = async (
  type?: 'desktop' | 'mobile'
): Promise<{
  browser: Browser
  page: Page
}> => {
  const ua = getUserAgent(type)
  const browser = await puppeteer.launch({
    headless: 'new',
  })

  const page = await browser.newPage()

  await page.setUserAgent(ua.ident)
  await page.setViewport(ua.screenSize)

  return { browser, page }
}
