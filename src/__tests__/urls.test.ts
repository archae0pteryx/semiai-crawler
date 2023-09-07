import { describe, expect, it } from '@jest/globals'
import {
  allHrefs,
  extractLinksFromHtml,
  hasDomain,
  isValidHref,
  removeHostAndProtocol,
  filteredHrefsWithoutProtocol,
  stripProtocolAndSanitize,
  extractTargetsFromHrefs,
} from '../urls'
import { ICrawlerConfig, DEFAULT_CONFIG } from '../config';

const html = `
<html>
<body>
<div class="main">
<a href="fake/link/without/front/slash">without leading slash</a>
<a href="/fake/link/with/front/slash">with leading slash</a>
<a href="/fake/link/with/hash#foobar">hash tag link</a>
<a href="https://good.host/link/with/https">good link</a>
<a href="https://domain.not.ours/fake/link/foo-lq.mp3">bad domain</a>
<a href="https://good.host/another-hq.mp3">good to target</a>
<a href="https://allowed.host/fake-lq.mp3">good to target</a>
<a href="https://allowed.host/foo-123.txt">good to target</a>
</div>
</body>
</html>
`

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
    expect(hrefs.length).toBe(8)
    })

  it('removes host and protocol from href', () => {
    const href = removeHostAndProtocol('https://foo.bar/baz')
    expect(href).toBe('/baz')
    const slashless = removeHostAndProtocol('https://foo.bar')
    expect(slashless).toBe('/')
  })

  it('extracts and filters hrefs from html', () => {
    const hrefs = extractLinksFromHtml('https://good.host', html, {
      ...DEFAULT_CONFIG,
      url: 'https://good.host/with/path',
      targets: []
    })
    expect(hrefs.size).toBe(4)
  })

  it('sanitizes an href', () => {
    const withoutSlash = stripProtocolAndSanitize('no/slash', 'good.host')
    expect(withoutSlash).toEqual('good.host/no/slash')

    const withSlash = stripProtocolAndSanitize('/with/slash', 'good.host')
    expect(withSlash).toEqual('good.host/with/slash')

    const validAlready = stripProtocolAndSanitize('https://different.host/with/slash', 'good.host')
    expect(validAlready).toEqual('different.host/with/slash')
  })

  it('extracts hrefs for root domain only if no allowed hosts in config', () => {
    const actual = filteredHrefsWithoutProtocol('http://good.host', html, {
      ...DEFAULT_CONFIG,
      url: 'https://good.host/foo'
    })
    expect(actual.size).toBe(4)
  })

  it('extracts allowed hosts with root hostname', () => {
    const actual = filteredHrefsWithoutProtocol('https://good.host', html, {
      ...DEFAULT_CONFIG,
      url: 'https://good.host/foo',
      allowed_hosts: ['allowed.host', 'bad.host'],
    })
    expect(actual.size).toBe(6)
  })

  it('returns all when no targets are specified', () => {
    const mockHrefs = new Set(['https://allowed.host/foo-123.txt', 'https://allowed.host/bar-456.txt'])
    const actual = extractTargetsFromHrefs(mockHrefs, {
      ...DEFAULT_CONFIG,
      targets: [],
    })
    expect(actual.size).toBe(2)
  })

  it('returns all matched targets', () => {
    const mockHrefs = new Set([
      'https://allowed.host/foo-123.txt',
      'https://allowed.host/bar-lq.mp3',
      'foo.bar/baz.bang',
    ])
    const actual = extractTargetsFromHrefs(mockHrefs, {
      ...DEFAULT_CONFIG,
      targets: ['.*txt', '.*-lq.mp3'],
    })
    expect(actual.size).toBe(2)
  })
})
