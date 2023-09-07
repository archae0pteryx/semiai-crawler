import * as cheerio from 'cheerio'

export const extractLinksFromHtml = (url: string, html: string) => {
  const hostname = new URL(url).hostname
  const allHref = allHrefs(html)
  const unique = [...new Set(allHref)]
  const allWithoutDomain = unique.filter((href) => !hasDomain(href))
  const allWithDomain = unique.filter(hasDomain)
  const allWithDomainAndGoodHost = allWithDomain.filter(
    (href) => isValidHref(href) && new URL(href).hostname === hostname
  )
  const allToStrip = [...allWithoutDomain, ...allWithDomainAndGoodHost]
  const strippedHrefs = allToStrip.map(removeHostAndProtocol)
  const filtered = strippedHrefs.filter((href) => href !== '/' && !href.includes('#'))
  const list = filtered.map((href) => `https://${hostname}${href}`)
  return new Set(list)
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

export const allHrefs = (html: string) => {
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
