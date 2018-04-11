export class Logger {
  isUse: boolean = false
  constructor(isUse: boolean = false) {
    this.isUse = isUse
  }

  log(level: string = 'log', ...value) {
    if (this.isUse === false) return
    console[level](...value)
  }
}