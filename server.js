import Pty  from './pty.js'
import logo from './logo.js'

export default class Server {
  constructor() {
    console.log(logo)

    this.ptys = {}
    process.on('SIGINT', this.kill.bind(this))
  }

  run() {
    this.create()
  }

  create() {
    let pty = new Pty(this.args[0], this.args[1])
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

  get args() {
    return process.argv.slice(2)
  }
}
