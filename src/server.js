import {createServer} from 'net'
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
    this.server = createServer(c => {
      c.on('data', data => {
        const parsedData = JSON.parse(data)

        if (parsedData.action === 'connect') {
          c.write(JSON.stringify(this.ptyPort()))
        }
      })
    }).
    listen('/tmp/beep-beep.sock')
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

    const countToEnqueue = this.queue - queuedCount;

    [...Array(Math.max(countToEnqueue, 0))].forEach(this.create.bind(this))
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

    this.server.close()
    process.exit(0)
  }

  ptyPort() {
    const pid = Object.keys(this.ptys).find(pid => !this.ptys[pid].connected)

    return this.ptys[pid].port
  }
}
