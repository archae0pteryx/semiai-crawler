import fs from 'fs'

export const pathFromUrl = (url: string, dataDir: string) => {
  const urlObj = new URL(url)
  const hostname = urlObj.hostname
  const pathname = urlObj.pathname
  const localPath = `${dataDir}/${hostname}${pathname}`

  if (localPath.endsWith('/')) {
    return localPath + 'index.html'
  }

  if (!localPath.endsWith('.html')) {
    return localPath + '.html'
  }

  return localPath
}

export const readFileFromUrl = (url: string, dataDir: string) => {
  const path = pathFromUrl(url, dataDir)
  return fs.readFileSync(path, 'utf8')
}

export const writeContentToFile = (path: string, content: string) => {
  const dir = path.split('/').slice(0, -1).join('/')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    })
  }
  fs.writeFileSync(path, content)
}
