import dotenv from 'dotenv'
import { scrape } from './scraper'

dotenv.config()

const DEFAULT_URL = process.env.DEFAULT_URL || 'https://www.grc.com/securitynow.htm'

;(async () => {
  const url = process.argv[2] || DEFAULT_URL
  await scrape(url)
})()
