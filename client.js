import {Socket} from 'net'

export default class Client {
  constructor() {
    this.socket = new Socket()
  }

  run() {
    process.stdin.setRawMode(true)
    process.stdin.setEncoding('utf8')
    process.stdin.resume()

    this.socket.connect(process.argv[2])
    this.socket.on('end',  () => process.exit(0))
    this.socket.on('data', data => process.stdout.write(data))
    process.stdin.on('data',  data => this.socket.write(data))
  }
}
