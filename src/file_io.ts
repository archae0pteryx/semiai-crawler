import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import colors from 'colors';

export const absDataPath = () => {
  const targetRootDir = path.join(__dirname, process.env.DATA_DIR || 'data')
  return targetRootDir
}

export const pathFromUrl = (url: string) => {
  const targetRootDir = absDataPath()
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

export const listAllFilesInDir = (dir: string): string[] => {
  try {
      const command = `find ${dir} -type f`
      const currentFiles = execSync(command).toString().trim().split('\n')
      return currentFiles
  } catch (err: any) {
    console.log('Directory not found or empty. continuing...')
    return []
  }
}

export const allFilesFromUrl = (url: string): string[] => {
  const localDir = absDataPath()
  const hostname = new URL(url).hostname
  const allFilesArr = listAllFilesInDir(`${localDir}/${hostname}`)
  return allFilesArr
}

export const dirFromUrl = (url: string): string => {
  const filename = pathFromUrl(url)
  const split = filename.split('/')
  split.pop()
  return split.join('/')
}

export const writeLocalHtml = (url: string, content: string) => {
  const hostname = new URL(url).hostname
  const targetRootDir = absDataPath()
  const rootDomainDir = `${targetRootDir}/${hostname}`
  if (!fs.existsSync(rootDomainDir)) {
    fs.mkdirSync(rootDomainDir, {
      recursive: true,
    })
  }
  const path = pathFromUrl(url)
  const dir = path.split('/').slice(0, -1).join('/')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    })
  }
  fs.writeFileSync(path, content)
}

export const loadFromLocal = (url: string) => {
  try {
    const path = pathFromUrl(url)
    return fs.readFileSync(path, 'utf8')
  } catch (err) {
    console.error(colors.red(`Failed to load from local: ${url}`))
    return ''
  }
}

export const writeLog = (content: string) => {
  const logFile = process.env.LOG_FILE
  if (logFile) {
    const targetRootDir = absDataPath()
    fs.appendFileSync(`${targetRootDir}/${logFile}`, content)
  }
}
