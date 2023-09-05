import puppeteer from 'puppeteer'
import { DESKTOP_USER_AGENTS } from './uas'
import fs from 'fs'
import { alreadyHaveHtml } from './check'
import { writeLocalHtml } from './file_io'
import { extractLinksFromHtml } from './urls'

const MAX_EXTRACT_COUNT = 100

const SEEN = new Set()
const QUEUE = new Set()

export const scrape = async (url: string) => {
  const now = new Date()

  const browser = await puppeteer.launch({
    headless: 'new',
  })

  const page = await browser.newPage()

  await page.setUserAgent(DESKTOP_USER_AGENTS[0])
  await page.setViewport({ width: 1920, height: 1080 })
  await page.goto(url, { waitUntil: 'networkidle0' })

  const actualUrl = page.url()
  const content = await page.content()

  writeLocalHtml(actualUrl, content)

  const hostname = new URL(actualUrl).hostname

  const initialList = extractLinksFromHtml(hostname, content)
  initialList.forEach((href) => QUEUE.add(href))

  while (QUEUE.size > 0 && SEEN.size < MAX_EXTRACT_COUNT) {
    console.log(`current url: ${url}`)
    console.log(`Queue size: ${QUEUE.size}`)
    console.log(`seen size: ${SEEN.size}`)

    const alreadyHave = alreadyHaveHtml(url)
    if (alreadyHave) {
      console.log(`We already have this file: ${url}`)
      continue
    }

    if (SEEN.has(url)) {
      console.log(`Already seen: ${url}`)
      continue
    }

    const href = QUEUE.values().next().value
    QUEUE.delete(href)
    try {
      console.log(`visiting: ${href}`)
      await page.goto(href, { waitUntil: 'networkidle0' })

      const html = await page.content()
      const actualUrl = page.url()

      writeLocalHtml(actualUrl, html)

      SEEN.add(href)

      const hrefList = extractLinksFromHtml(actualUrl, html)
      console.log(`adding ${hrefList.length} links to queue`)
      hrefList.forEach((href) => QUEUE.add(href))
    } catch (err: any) {
      console.error(`Failed: ${url}`, err.message)
      SEEN.add(href)
      continue
    }
  }
  const endTime = new Date()
  const timeDiff = endTime.getTime() - now.getTime()
  const seconds = timeDiff / 1000
  console.log(`Took ${seconds} seconds`)
  await browser.close()
}
