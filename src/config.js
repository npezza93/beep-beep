import path         from 'path'
import fs           from 'fs'
import chokidar     from 'chokidar'
import EventEmitter from 'events'

export default class Config {
  constructor(options) {
    this.options = options
    this.dataEmitter = new EventEmitter()

    const filePath = path.join(options.configFile || '');

    if (options.configFile && fs.existsSync(filePath)) {
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

  get watch() {
    return this.json.watch || this.options.watch
  }

  onChange(callback) {
    this.dataEmitter.on('change', callback)
  }

  async stopWatching() {
    if (this.watcher) {
      this.dataEmitter.removeAllListeners()
      await this.watcher.close()
      console.log('Stopped watching files')
    }
  }

  watchFiles() {
    if (this.watch) {
      const watchFiles =
        this.watch.split(',').map(file => file.replace(/^\s+|\s+$/g, ''))

      this.watcher = chokidar.watch(watchFiles)
      this.watcher.on('change', path => this.dataEmitter.emit('change'))
    }
  }
}
