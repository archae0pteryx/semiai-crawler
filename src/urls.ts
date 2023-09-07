import * as cheerio from 'cheerio'
import { ICrawlerConfig } from './config'

export const stripProtocolAndSanitize = (href: string, hostname: string) => {
  if (isValidHref(href)) {
    return href.replace(/^(https?:)?\/\//, '')
  }

  if (href.startsWith('/')) {
    return `${hostname}${href}`
  }

  return `${hostname}/${href}`
}

export const extractTargetsFromHrefs = (hrefs: Set<string>, config: ICrawlerConfig): Set<string> => {
  if (config.targets.length === 0) {
    return hrefs
  }
  const regexes = config.targets.map((pattern) => new RegExp(pattern))
  const matchedTargets = [...hrefs].filter((str) => regexes.some((regex) => regex.test(str)))
  return new Set(matchedTargets)
}

export const filteredHrefsWithoutProtocol = (currentUrl: string, html: string, config: ICrawlerConfig): Set<string> => {
  const rootHostname = new URL(currentUrl).hostname
  const allowedHostnames = [...config.allowed_hosts, rootHostname]
  const allUniqueHrefs = [...new Set(allHrefs(html))]
  const strippedHrefs = allUniqueHrefs
    .map((href) => stripProtocolAndSanitize(href, rootHostname))
    .filter((h) => !h.includes('#'))
    .filter((h) => allowedHostnames.some((a) => h.includes(a)))

  return new Set(strippedHrefs)
}

export const extractTargets = (currentHref: string, html: string, config: ICrawlerConfig): Set<string> => {
  const filtered = filteredHrefsWithoutProtocol(currentHref, html, config)
  const targeted = extractTargetsFromHrefs(filtered, config)
  return targeted
}

export const extractLinksFromHtml = (currentHref: string, html: string, config: ICrawlerConfig): Set<string> => {
  const allUniqueHrefs = [...new Set(allHrefs(html))]
  const targets = extractTargets(currentHref, html, config)

  return new Set([...targets].map((t) => `https://${t}`))
}

export const hasDomain = (href: string) => {
  return href.startsWith('http')
}

export const isValidHref = (href: string) => {
  try {
    new URL(href)
    return true
  } catch (_) {
    return false
  }
}

export const allHrefs = (html: string): string[] => {
  const $ = cheerio.load(html)

  const allHref = $('a')
    .map((_, el) => $(el).attr('href'))
    .get()

  return allHref
}

export const removeHostAndProtocol = (url: string) => {
  if (!isValidHref(url)) {
    return url
  }
  const urlObj = new URL(url)
  const segments = urlObj.pathname.split('/')

  segments.shift()

  const joined = segments.join('/')

  if (joined.startsWith('/')) {
    return joined
  }
  return `/${joined}`
}
