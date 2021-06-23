import {spawn} from 'node-pty'
import debounceFn from 'debounce-fn'
import {createServer} from 'net'
import EventEmitter from 'events'

export default class Pty {
  constructor(file, fileArgs) {
    this.file = file
    this.fileArgs = (fileArgs || '').split(',').filter(arg => !!arg)
    this.bufferedData = ''
    this.bufferTimeout = null
    this.dataEmitter = new EventEmitter()

    this.pty = spawn(this.file, this.fileArgs, this.sessionArgs)
    this.pty.pause()
    this.pty.onData(data => this.bufferData(data))

    this.server = createServer(c => {
      console.log(`[PID ${this.pid}] Connected to ${this.fd}`)
      c.on('end', this.kill.bind(this))
      c.on('data', data => this.write(data))
      this.pty.onExit(() => c.end())
    }).
    listen({ port: 0, exclusive: true }).
    on('connection', socket => {
      this.pty.resume()
      this.onData(data => {
        if (socket.readyState === 'open') {
          socket.write(data)
        }
      })
    })

    console.log(`[PID ${this.pid}] Created ${this.fd}. Connect via localhost:${this.port}`)
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

  get port() {
    return this.server.address().port
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
    this.dataEmitter.removeAllListeners('data')
    console.log(`[PID ${this.pid}] Killing ${this.fd} pty`)
    this.pty.destroy()
    console.log(`[PID ${this.pid}] Killing ${this.fd} server`)
    this.server.close()
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

  bufferData(data) {
    this.bufferedData += data
    if (!this.bufferTimeout) {
      this.bufferTimeout = debounceFn(() => {
        this.dataEmitter.emit('data', this.bufferedData)
        this.bufferedData = ''
        this.bufferTimeout = null
      }, {wait: 5})()
    }
  }
}