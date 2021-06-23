import {Socket} from 'net'

export default class Client {
  constructor(port) {
    this.port = port
    this.socket = new Socket()
  }

  run() {
    process.stdin.setRawMode(true)
    process.stdin.setEncoding('utf8')
    process.stdin.resume()

    this.socket.connect(this.port)
    this.socket.on('end',  () => process.exit(0))
    this.socket.on('data', data => process.stdout.write(data))
    process.stdin.on('data',  data => this.socket.write(data))
  }
}
