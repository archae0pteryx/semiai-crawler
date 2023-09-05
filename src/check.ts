import { execSync } from 'child_process'
import { pathFromUrl } from './file_io';
import path from 'path'

// find python.langchain.com -type f -exec dirname {} \; | sort | uniq -c | sort -nr | head -n 1 | awk '{print $2}'

export const listAllFilesInDir = (dir: string): string[] => {
  const command = `find ${dir} -type f`
  const currentFiles = execSync(command)
    .toString()
    .trim()
    .split('\n')

  if (!currentFiles.length) {
    throw new Error(`Error listing files in dir: ${dir}`)
  }

  return currentFiles
}

export const alreadyHaveHtml = (url: string) => {
  const localFile = pathFromUrl(url)
  const searchDir = localFile.split('/').slice(0, -1).join('/')
  const allFilesArr = listAllFilesInDir(searchDir)
  const fileSet = new Set(allFilesArr)
  const seen = fileSet.has(localFile)
  return seen
}

export const filenameFromUrl = (url: string): string => {
  const urlObj = new URL(url)
  const segments = urlObj.pathname.split('/')
  const filename = segments.pop()
  if (!filename) {
    throw new Error(`Error getting filename from: ${url}`)
  }
  return filename
}
