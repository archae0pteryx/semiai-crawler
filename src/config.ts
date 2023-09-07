import fs from 'fs'
import colors from 'colors'

const CONFIG_PATH = process.env.CONFIG_PATH || './crawler.config.json'

export interface ICrawlerConfig {
  targets: string[]
  allowed_hosts: string[]
  max_filesize: string
  max_depth: number
  follow: boolean
  url: string
  data_dir: string
  stdout_log: string
  stderr_log: string
  debug: boolean
}

export const DEFAULT_CONFIG: ICrawlerConfig = {
  url: 'https://www.grc.com/securitynow.htm',
  targets: [],
  allowed_hosts: [],
  follow: false,
  max_filesize: '0',
  max_depth: 10,
  data_dir: '../data',
  stdout_log: 'tmp/stdout.log',
  stderr_log: 'tmp/stderr.log',
  debug: false,
}

export const loadConfig = (): ICrawlerConfig => {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH).toString())
    return {
      ...DEFAULT_CONFIG,
      ...config,
    }
  } catch (err) {
    console.warn(colors.yellow(`[warning]: ${CONFIG_PATH} not found. using default config`))
    return DEFAULT_CONFIG
  }
}
