import {createServer} from 'net'
import Pty  from './pty.js'
import logo from './logo.js'

export default class Server {
  constructor(config) {
    this.config = config
    this.ptys = {}

    console.log(logo)

    process.on('SIGINT', this.shutdown.bind(this))
    this.server = createServer(c => {
      c.on('data', data => {
        const parsedData = JSON.parse(data)

        if (parsedData.action === 'connect') {
          c.write(JSON.stringify(this.enqueuedPtys()[0].port))
        } else if (parsedData.action === 'resize') {
          this.ptys[parsedData.port].resize(parsedData.columns, parsedData.rows)
        }
      })
    }).
    listen('/tmp/beep-beep.sock')
  }

  run() {
    this.config.watchFiles()
    this.config.onChange(() => this.enqueuedPtys().forEach((pty) => pty.kill()))
    this.enqueuePtys()
  }

  enqueuePtys() {
    let queuedCount = 0
    for (const port in this.ptys) {
      if (!this.ptys[port].connected) {
        queuedCount++
      }
    }

    const countToEnqueue = this.config.queue - queuedCount;

    [...Array(Math.max(countToEnqueue, 0))].forEach(this.create.bind(this))
  }

  create() {
    let pty = new Pty(this.config.shell, this.config.args)
    pty.onExit((port) => {
      delete this.ptys[port]
      this.create()
    })
    pty.onConnected(this.enqueuePtys.bind(this))
    this.ptys[pty.port] = pty
  }

  async shutdown() {
    console.log("- Gracefully stopping, shutting down all ptys and servers")
    await this.config.stopWatching()
    Object.keys(this.ptys).forEach(id => {
      if (this.ptys[id]) {
        this.ptys[id].dataEmitter.removeAllListeners()
        this.ptys[id].kill()
        delete this.ptys[id]
      }
    })

    this.server.close()

    console.log(`=== beep-beep shutdown: ${new Date().toLocaleTimeString('en-US')} ===`)
    console.log('Goodbye!')
    process.exit(0)
  }

  enqueuedPtys() {
    return Object.values(this.ptys).filter(pty => !pty.connected)
  }
}
