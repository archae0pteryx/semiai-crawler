import { describe, expect, it } from '@jest/globals'
import { listAllFilesInDir, alreadyHaveHtml } from '../check'
import fs from 'fs'

const FIXTURES_DIR = '__tests__/fixtures'
const TARGET_URL = 'https://foo.bar/mockdir/'

process.env.DATA_DIR = FIXTURES_DIR

describe('checks', () => {
  it('lists all files in a dir as path', () => {
    const rootDir = new URL(TARGET_URL).hostname
    const files = listAllFilesInDir(`src/${FIXTURES_DIR}/${rootDir}`)
    expect(files.length).toBe(4)
    files.map((f) => expect(fs.existsSync(f)))
  })
  it('checks if html already exists', () => {
    const exists = alreadyHaveHtml(TARGET_URL)
    expect(exists).toBe(true)
  })
})
