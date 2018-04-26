export type Level = 'log' | 'warn' | 'error'

export class Logger {
  isUse: boolean = false
  level: Level

  constructor(isUse: boolean = false, level: Level = 'log') {
    this.isUse = isUse
    this.level = level
  }

  log(...value) {
    if (this.isUse === false) return
    console.log(...value)
  }

  warn(...value) {
    if (this.isUse === false) return
    if (this.level === 'log') return
    console.warn(...value)
  }

  error(...value) {
    if (this.isUse === false) return
    if (this.level !== 'error') return
    console.warn(...value)
  }
}
