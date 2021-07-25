import {spawn} from 'node-pty'
import {createServer} from 'net'
import EventEmitter from 'events'

export default class Pty {
  constructor(file, fileArgs) {
    this.file = file
    this.fileArgs = (fileArgs || '').split(',').filter(arg => !!arg)
    this.bufferedData = ''
    this.bufferTimeout = null
    this.dataEmitter = new EventEmitter()
    this.connected = false

    this.pty = spawn(this.file, this.fileArgs, this.sessionArgs)
    this.pty.pause()

    this.server = createServer(c => {
      console.log(`[PID ${this.pid}] Connected to ${this.fd}`)
      this.connected = true
      this.dataEmitter.emit('connected')

      c.on('end', this.kill.bind(this))
      c.on('data', data => this.write(data))
      this.pty.onExit(() => c.end())
    }).
    listen(`/tmp/beep-beep-${this.pid}.sock`).
    on('connection', socket => {
      this.pty.resume()
      this.pty.onData(data => {
        if (socket.readyState === 'open') {
          socket.write(data)
        }
      })
    })

    console.log(`[PID ${this.pid}] Created ${this.fd}. Connect via /tmp/beep-beep-${this.pid}.sock`)
  }

  get shell() {
    return process.env.SHELL || '/bin/bash'
  }

  get pid() {
    return this.pty.pid
  }

  get fd() {
    return this.pty._pty
  }

  get sessionArgs() {
    return {
      name: 'xterm-256color',
      cwd: process.env.HOME,
      env: { TERM: 'xterm-256color', COLORTERM: 'truecolor', ...process.env }
    }
  }

  kill() {
    this.pty.removeAllListeners('data')
    this.pty.removeAllListeners('exit')
    console.log(`[PID ${this.pid}] Killing ${this.fd} pty`)
    this.pty.destroy()
    console.log(`[PID ${this.pid}] Killing ${this.fd} server`)
    this.server.close()
    this.dataEmitter.emit('exit', this.pid)
    this.dataEmitter.removeAllListeners()
  }

  onData(callback) {
    this.dataEmitter.on('data', callback)
  }

  resize(cols, rows) {
    if (Number.isInteger(cols) && Number.isInteger(rows) && !this.pty._emittedClose) {
      try {
        this.pty.resize(cols, rows)
      } catch (error) {
        console.log(error)
      }
    }
  }

  write(data) {
    this.pty.write(data)
  }

  handleWrite(event, data) {
    this.write(data)
  }

  handleResize(event, {cols, rows}) {
    this.resize(cols, rows)
  }

  onExit(callback) {
    this.dataEmitter.on('exit', callback)
  }

  onConnected(callback) {
    this.dataEmitter.on('connected', callback)
  }
}
