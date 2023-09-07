import { describe, expect, it } from '@jest/globals'
import { pathFromUrl, writeContentToFile } from '../file_io'

const DATA_DIR = '__tests__/fixtures'

const TARGET_URL = 'https://foo.bar/mockdir/file.html'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}))

describe('checks', () => {
  it('extracts the path from a url', () => {
    const path = pathFromUrl(TARGET_URL, DATA_DIR)
    expect(path).toBe('__tests__/fixtures/foo.bar/mockdir/file.html')
  })

  it('adds index.html to the end of a url if ends in a /', () => {
    const mockPath = 'https://foo.bar/mockdir/'
    const path = pathFromUrl(mockPath, DATA_DIR)
    expect(path).toBe('__tests__/fixtures/foo.bar/mockdir/index.html')
  })

  it('writes content to file', () => {
    const mockPath = 'https://foo.bar/mockdir/'
    const path = pathFromUrl(mockPath, DATA_DIR)
    writeContentToFile(path, 'foo')
    expect(require('fs').writeFileSync).toHaveBeenCalledWith(path, 'foo')
  })
})
