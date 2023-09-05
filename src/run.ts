import { scrape } from './scraper'

;(async () => {
  await scrape('https://python.langchain.com/docs/get_started/introduction.html')
})()
