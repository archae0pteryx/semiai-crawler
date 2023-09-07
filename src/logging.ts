import colors from 'colors'
import fs from 'fs'
import { ICrawlerConfig } from './config'

interface ILogArgs {
  color?: keyof typeof COLORS
  msg: string
  write?: boolean
}

type LogArgs = ILogArgs | string

const COLORS = {
  grey: colors.grey,
  red: colors.red,
  yellow: colors.yellow,
  green: colors.green,
  blue: colors.blue,
}

export class Logger {
  private config: ICrawlerConfig
  private colors = COLORS

  constructor(config: ICrawlerConfig) {
    this.config = config
  }

  public log(args: LogArgs) {
    const { color = 'grey', msg, write } = args as ILogArgs
    const message = typeof args === 'string' ? args : msg
    const logFile = this.config.stdout_log
    if (logFile && write) {
      fs.appendFileSync(logFile, `${message}\n`)
    }
    if (this.config.debug) {
      console.info(this.colors[color](message))
    }
  }

  public error(args: LogArgs) {
    const { color = 'red', msg, write } = args as ILogArgs
    const errorLogFile = this.config.stderr_log
    const message = typeof args === 'string' ? args : msg
    if (errorLogFile && write) {
      fs.appendFileSync(errorLogFile, `${message}\n`)
    }
    if (this.config.debug) {
      console.error(this.colors[color](message))
    }
  }

  public info(args: LogArgs) {
    const { color = 'blue', msg } = args as ILogArgs
    const message = typeof args === 'string' ? args : msg
    console.info(this.colors[color](message))
  }
}
