import Pty  from './pty.js'
import logo from './logo.js'

export default class Server {
  constructor(queue, shell, args) {
    this.queue = queue
    this.shell = shell
    this.args  = args
    this.ptys = {}

    console.log(logo)

    process.on('SIGINT', this.shutdown.bind(this))
  }

  run() {
    this.enqueuePtys()
  }

  enqueuePtys() {
    let queuedCount = 0
    for (const pid in this.ptys) {
      if (!this.ptys[pid].connected) {
        queuedCount++
      }
    }

    [...Array(this.queue - queuedCount)].forEach(this.create.bind(this))
  }

  create() {
    let pty = new Pty(this.shell, this.args)
    pty.onExit((pid) => {
      delete this.ptys[pid]
      this.create()
    })
    pty.onConnected(this.enqueuePtys.bind(this))
    this.ptys[pty.pid] = pty
  }

  shutdown() {
    console.log("\nShutting down beep-beep\n")
    Object.keys(this.ptys).forEach(id => {
      if (this.ptys[id]) {
        this.ptys[id].dataEmitter.removeAllListeners()
        this.ptys[id].kill()
        delete this.ptys[id]
      }
    })

    process.exit(0)
  }
}
