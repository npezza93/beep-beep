import Pty  from './pty.js'
import logo from './logo.js'

export default class Server {
  constructor(queue, shell, args) {
    this.queue = queue
    this.shell = shell
    this.args  = args
    this.ptys = {}

    console.log(logo)

    process.on('SIGINT', this.kill.bind(this))
  }

  run() {
    this.create()
  }

  create() {
    let pty = new Pty(this.shell, this.args)
    this.ptys[pty.pid] = pty
  }

  kill() {
    console.log("\nShutting down beep-beep\n")
    Object.keys(this.ptys).forEach(id => {
      if (this.ptys[id]) {
        this.ptys[id].kill()
        delete this.ptys[id]
      }
    })

    process.exit(0)
  }
}
