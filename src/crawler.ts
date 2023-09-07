import colors from 'colors'
import fs from 'fs'
import { buildBrowser } from './browser'
import type { ICrawlerConfig } from './config'
import { pathFromUrl, readFileFromUrl, writeContentToFile } from './file_io'
import { Logger } from './logging'
import { extractLinksFromHtml } from './urls'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const updateCount = (count = 0) => {
  if (count === 0) {
    return 0
  }
  return count + 1
}

export const crawl = async (config: ICrawlerConfig) => {
  let count = updateCount()
  const SEEN = new Set()
  const QUEUE = new Set()
  const SLEEP_MS = Number(process.env.SLEEP_MS || 0)

  const now = new Date()

  const logger = new Logger(config)

  QUEUE.add(config.url)

  const { browser, page } = await buildBrowser()

  while ((QUEUE.size > 0 && count < config.max_depth) || count === 0) {
    sleep(SLEEP_MS)
    const currentHref = QUEUE.values().next().value
    QUEUE.delete(currentHref)

    const currentHrefLocalPath = pathFromUrl(currentHref, config.data_dir)

    if (fs.existsSync(currentHrefLocalPath)) {
      SEEN.add(currentHref)

      const html = readFileFromUrl(currentHref, config.data_dir)
      const newHrefList = extractLinksFromHtml(currentHref, html, config)

      newHrefList.forEach((newHref) => {
        const p = pathFromUrl(newHref, config.data_dir)
        const exists = fs.existsSync(p)

        if (exists && count !== 0) {
          SEEN.add(newHref)
          logger.log(`[exists]: ${newHref}`)
        } else {
          QUEUE.add(newHref)
          logger.log({ msg: `[updated queue]: ${newHref}`, write: false })
        }
      })
      count = updateCount(count)
      continue
    }

    try {
      logger.log({ color: 'blue', msg: `[target]: ${colors.underline(currentHref)}` })
      await page.goto(currentHref, { waitUntil: 'networkidle0' })

      SEEN.add(currentHref)

      const html = await page.content()
      const actualUrl = page.url()
      const localUrlPath = pathFromUrl(actualUrl, config.data_dir)

      writeContentToFile(localUrlPath, html)

      const hrefList = extractLinksFromHtml(actualUrl, html, config)

      hrefList.forEach((newHref) => {
        const p = pathFromUrl(currentHref, config.data_dir)
        const exists = fs.existsSync(p)

        if (exists && count !== 0) {
          SEEN.add(newHref)
          logger.log(`[exists]: ${newHref}`)
        } else {
          QUEUE.add(newHref)
          logger.log(`[added]: ${newHref}`)
        }
      })
    } catch (err: any) {
      logger.error(`[fail]: ${err.message}`)
    } finally {
      if (!config.follow) {
        logger.info(`[no follow set]: ${currentHref}`)
        break
      }
      count = updateCount(count)
    }
  }
  const endTime = new Date()
  const timeDiff = endTime.getTime() - now.getTime()
  const seconds = timeDiff / 1000
  logger.log({ msg: `Time elapsed: ${seconds} seconds`, color: 'green' })
  await browser.close()
}
