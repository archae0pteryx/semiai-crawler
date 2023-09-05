import { scrape } from './scraper'
import dotenv from 'dotenv'

dotenv.config()

;(async () => {
  await scrape('https://python.langchain.com/docs/get_started/introduction.html')
})()
