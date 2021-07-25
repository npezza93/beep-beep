import {Socket} from 'net'

export default class Client {
  run() {
    process.stdin.setRawMode(true)
    process.stdin.setEncoding('utf8')
    process.stdin.resume()

    let socket = this.socket()
    socket.on('data', pid => {
      socket.destroy()

      this.pid = JSON.parse(pid)
      const ptySocket = new Socket()
      const resizeSocket = this.socket()

      ptySocket.connect(`/tmp/beep-beep-${this.pid}.sock`)

      resizeSocket.write(this.resizeData())

      ptySocket.on('end',  () => {
        ptySocket.destroy()
        resizeSocket.destroy()
        process.exit(0)
      })
      ptySocket.on('data', data => process.stdout.write(data))
      process.stdin.on('data',  data => ptySocket.write(data))
      process.stdout.on('resize', () => resizeSocket.write(this.resizeData()))
    })
    socket.write(JSON.stringify({ action: "connect"}))
  }

  get columns() {
    return process.stdout.columns
  }

  get rows() {
    return process.stdout.rows
  }

  socket() {
    let socket = new Socket()
    socket.connect("/tmp/beep-beep.sock")
    socket.on('error', (e) => {
      if (e.code == 'ENOENT') {
        console.error("Can't connect to beep-beep server. Make sure it is running by running the following:")
        console.error("\n\tbeep-beep server -q 1 -s /bin/zsh")
      } else {
        console.error('Error booting beep-beep', e)
      }
      process.exit(1)
    })

    return socket
  }

  resizeData() {
    return JSON.stringify({
      action: "resize", pid: this.pid,
      columns: this.columns, rows: this.rows
    })
  }
}
