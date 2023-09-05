import { describe, expect, it } from '@jest/globals'
import { allHrefs, extractLinksFromHtml, hasDomain, isValidHref, removeHostAndProtocol } from '../urls'

const html = `
<html>
<body>
<div class="main">
<a href="fake/link/without/front/slash">fake link without front slash</a>
<a href="/fake/link/with/front/slash">fake link with front slash</a>
<a href="/fake/link/with/hash#foobar">fake link with https</a>
<a href="https://good.host/link/with/https">fake link with https</a>
<a href="https://domain.not.ours/fake/link">fake link with another domain</a>
</div>
</body>
</html>
`
/*
9 good
4 bad
*/
const HREF_LIST = [
  'link/without/front/slash', // good
  '/link/with/front/slash', // good
  'https://good.host/regular/link', //good
  'http://good.host/http/link', //good
  'https://good.host', // good
  'http://bad.host/http/link', // bad
  'https://bad.host/regular/link', // bad
  'https://good.host/link/with#hash', //bad
  'https://bad.host/link/with#hash', // bad
]

const GOOD_HOST = 'https://good.host/with/path'

describe('scraper', () => {
  it('checks if href has domain', () => {
    const withDomain = hasDomain(GOOD_HOST)
    expect(withDomain).toBe(true)
    const witoutDomain = hasDomain('/without')
    expect(witoutDomain).toBe(false)
  })
  it('checks for valid href', () => {
    const valid = isValidHref(GOOD_HOST)
    expect(valid).toBe(true)
    const invalid = isValidHref('not a url')
    expect(invalid).toBe(false)
  })

  it('extracts hrefs from html', () => {
    const hrefs = allHrefs(html)
    expect(hrefs.length).toBe(5)
  })

  it('removes host and protocol from href', () => {
    const href = removeHostAndProtocol('https://foo.bar/baz')
    expect(href).toBe('/baz')
    const slashless = removeHostAndProtocol('https://foo.bar')
    expect(slashless).toBe('/')
  })
  it('extracts and filters hrefs from html', () => {
    const hrefs = extractLinksFromHtml(GOOD_HOST, html)
    expect(hrefs.length).toBe(3)
  })
})
