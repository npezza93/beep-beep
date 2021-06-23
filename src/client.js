import {Socket} from 'net'

export default class Client {
  run() {
    process.stdin.setRawMode(true)
    process.stdin.setEncoding('utf8')
    process.stdin.resume()

    let socket = new Socket()
    socket.connect("/tmp/beep-beep.sock")
    socket.on('data', port => {
      socket.destroy()

      port = parseInt(port.toString())
      const ptySocket = new Socket()
      ptySocket.connect(port)

      ptySocket.on('end',  () => {
        ptySocket.destroy()
        process.exit(0)
      })
      ptySocket.on('data', data => process.stdout.write(data))
      process.stdin.on('data',  data => ptySocket.write(data))
    })
    socket.write(JSON.stringify({ action: "connect"}))
  }
}
