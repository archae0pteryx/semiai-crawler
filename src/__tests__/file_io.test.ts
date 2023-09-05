import { describe, expect, it } from '@jest/globals'
import { pathFromUrl, writeLocalHtml } from '../file_io'
import fs from 'fs'

const TARGET_URL = 'https://foo.bar/mockdir/file.html'

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}))


describe('checks', () => {
  it('extracts the path from a url', () => {
    const path = pathFromUrl(TARGET_URL)
    expect(path).toBe('foo.bar/mockdir/file.html')
  })
  it('adds index.html to the end of a url if ends in a /', () => {
    const mockPath = 'https://foo.bar/mockdir/'
    const path = pathFromUrl(mockPath)
    expect(path).toBe('foo.bar/mockdir/index.html')
  })
  it('writes the correct filename', () => {
    const MOCK_URL = 'https://web.site/docs/foobar.html'
    jest.mocked(fs.existsSync).mockReturnValueOnce(true)
    writeLocalHtml(MOCK_URL, 'content')
    expect(fs.existsSync).toHaveBeenCalledWith('web.site/docs')
    expect(fs.writeFileSync).toHaveBeenCalledWith('web.site/docs/foobar.html', 'content')
  })
})
