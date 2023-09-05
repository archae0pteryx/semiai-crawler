import puppeteer from 'puppeteer'
import { DESKTOP_USER_AGENTS } from './uas'
import { loadFromLocal, pathFromUrl, writeLocalHtml, allFilesFromUrl, writeLog } from './file_io';
import { extractLinksFromHtml } from './urls'
import colors from 'colors'

const SEEN = new Set()
const QUEUE = new Set()

export const scrape = async (initialUrl: string) => {
  let count = 0
  const now = new Date()

  const seenFiles = allFilesFromUrl(initialUrl)
  seenFiles.forEach((file) => SEEN.add(file))

  QUEUE.add(initialUrl)

  const browser = await puppeteer.launch({
    headless: 'new',
  })

  const page = await browser.newPage()

  await page.setUserAgent(DESKTOP_USER_AGENTS[0])
  await page.setViewport({ width: 1920, height: 1080 })

  while (QUEUE.size > 0 || count === 0) {
    const href = QUEUE.values().next().value
    QUEUE.delete(href)

    // const target = colors.blue(`[target]: ...${href.slice(-20)}`)
    // const queue = colors.grey(`[queue]: ${QUEUE.size}`)
    // const seen = colors.grey(`[seen]: ${SEEN.size}`)

    // console.log(`${target} ${queue} ${seen}`)

    const localFilePath = pathFromUrl(href)
    const alreadyHave = SEEN.has(localFilePath)
    if (alreadyHave) {
      const html = loadFromLocal(href)
      const hrefList = extractLinksFromHtml(href, html)
      hrefList.forEach((h) => QUEUE.add(h))
      console.log(colors.yellow(`[skipped]: ${href}`))
      count++
      continue
    }

    try {
      console.log(colors.blue(`[target]: ${colors.underline(href)}`))
      await page.goto(href, { waitUntil: 'networkidle0' })

      const html = await page.content()
      const actualUrl = page.url()

      writeLocalHtml(actualUrl, html)

      SEEN.add(localFilePath)

      const hrefList = extractLinksFromHtml(actualUrl, html)
      hrefList.forEach((href) => QUEUE.add(href))
    } catch (err: any) {
      console.error(colors.red(`Failed: ${initialUrl}`), err.message)
      SEEN.add(localFilePath)
    } finally {
      count++
      writeLog(`${href}\n`)
    }
  }
  const endTime = new Date()
  const timeDiff = endTime.getTime() - now.getTime()
  const seconds = timeDiff / 1000
  console.log(colors.green(`Took ${seconds} seconds`))
  await browser.close()
}
