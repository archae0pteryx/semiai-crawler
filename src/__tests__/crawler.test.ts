import { describe, expect, it } from '@jest/globals'
import { DEFAULT_CONFIG } from '../config'
import * as c from '../crawler'

jest.mock('fs')

const countSpy = jest.spyOn(c, 'updateCount')

jest.mock('puppeteer', () => ({
  launch: () => ({
    newPage: jest.fn().mockReturnValue({
      setUserAgent: jest.fn(),
      setViewport: jest.fn(),
    }),
    close: jest.fn(),
  }),
}))

jest.mock('../logging', () => ({
  Logger: jest.fn().mockReturnValue({
    log: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  }),
}))

describe('scraper', () => {
  it('scrapes', async () => {
    await c.crawl({
      ...DEFAULT_CONFIG,
    })
    expect(countSpy).toHaveBeenCalledTimes(1)
  })
})
