import path from 'path'
import fs from 'fs'

export default class Config {
  constructor(options) {
    this.options = options

    const filePath = path.join(options.configFile || '');

    if (filePath && fs.existsSync(filePath)) {
      try {
        this.json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      } catch (e) {
        console.error(`Error parsing ${filePath} as JSON`)
        process.exit(1)
      }
    } else {
      this.json = {}
    }
  }

  get queue() {
    return this.json.queue || this.options.queue
  }

  get shell() {
    return this.json.shell || this.options.shell
  }

  get args() {
    return this.json.args || this.options.args
  }
}
