import colors from 'colors'
import fs from 'fs'
import puppeteer from 'puppeteer'
import { error, loadFromLocal, log, pathFromUrl, writeLocalHtml } from './file_io'
import { DESKTOP_USER_AGENTS } from './uas'
import { extractLinksFromHtml } from './urls'

const MAX_DEPTH = 3
const SEEN = new Set()
const QUEUE = new Set()
const SLEEP_MS = Number(process.env.SLEEP_MS || 0)

const sleep = (ms = SLEEP_MS) => new Promise((resolve) => setTimeout(resolve, ms))

export const scrape = async (initialUrl: string) => {
  let count = 0
  const now = new Date()

  QUEUE.add(initialUrl)

  const browser = await puppeteer.launch({
    headless: 'new',
  })

  const page = await browser.newPage()

  await page.setUserAgent(DESKTOP_USER_AGENTS[0])
  await page.setViewport({ width: 1920, height: 1080 })

  while ((QUEUE.size > 0 && count < MAX_DEPTH) || count === 0) {
    sleep(SLEEP_MS)
    const currentHref = QUEUE.values().next().value
    QUEUE.delete(currentHref)

    const currentHrefLocalPath = pathFromUrl(currentHref)

    if (fs.existsSync(currentHrefLocalPath)) {
      SEEN.add(currentHref)

      const html = loadFromLocal(currentHref)
      const newHrefList = extractLinksFromHtml(currentHref, html)

      newHrefList.forEach((newHref) => {
        const p = pathFromUrl(newHref)
        const exists = fs.existsSync(p)

        if (exists && count !== 0) {
          SEEN.add(newHref)
          log({ msg: `[exists]: ${newHref}` })
        } else {
          QUEUE.add(newHref)
          log({ msg: `[updated queue]: ${newHref}` })
        }
      })
      count++
      continue
    }

    try {
      console.log(colors.blue(`[target]: ${colors.underline(currentHref)}`))
      await page.goto(currentHref, { waitUntil: 'networkidle0' })

      SEEN.add(currentHref)

      const html = await page.content()
      const actualUrl = page.url()

      writeLocalHtml(actualUrl, html)

      const hrefList = extractLinksFromHtml(actualUrl, html)
      hrefList.forEach((newHref) => {
        const p = pathFromUrl(newHref)
        const exists = fs.existsSync(p)

        if (exists && count !== 0) {
          SEEN.add(newHref)
          log({ msg: `[exists]: ${newHref}` })
        } else {
          QUEUE.add(newHref)
          log({ msg: `[added]: ${newHref}` })
        }
      })
    } catch (err: any) {
      error({ msg: `[fail]: ${initialUrl}\n${err.message}` })
    } finally {
      count++
      log({ msg: `${currentHref}\n`, color: 'blue' })
    }
  }
  const endTime = new Date()
  const timeDiff = endTime.getTime() - now.getTime()
  const seconds = timeDiff / 1000
  console.log(colors.green(`Took ${seconds} seconds`))
  await browser.close()
}
