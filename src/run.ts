import dotenv from 'dotenv'
import { crawl } from './crawler'
import { loadConfig } from './config'

dotenv.config()

;(async () => {
  const config = loadConfig()
  await crawl(config)
})()
