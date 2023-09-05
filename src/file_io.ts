import fs from 'fs'
import path from 'path'

export const pathFromUrl = (url: string) => {
  const targetRootDir = path.join(__dirname, process.env.DATA_DIR || 'data')
  const urlObj = new URL(url)
  const hostname = urlObj.hostname
  const pathname = urlObj.pathname
  const actualPath = `${targetRootDir}/${hostname}${pathname}`

  if (actualPath.endsWith('/')) {
    return actualPath + 'index.html'
  }

  if (!actualPath.endsWith('.html')) {
    return actualPath + '.html'
  }

  return actualPath
}

export const writeLocalHtml = (url: string, content: string) => {
  const path = pathFromUrl(url)
  const dir = path.split('/').slice(0, -1).join('/')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    })
  }
  fs.writeFileSync(path, content)
}
