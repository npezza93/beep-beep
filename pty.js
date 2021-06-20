import {spawn} from 'node-pty'
import debounceFn from 'debounce-fn'
import {createServer} from 'net'
import EventEmitter from 'events'

export default class Pty {
  constructor(file, fileArgs) {
    this.file = file
    this.fileArgs = [fileArgs].filter(arg => !!arg)
    this.bufferedData = ''
    this.bufferTimeout = null
    this.dataEmitter = new EventEmitter()
    this.connected = false

    this.pty = spawn(this.file, this.fileArgs, this.sessionArgs)
    this.pty.onData(data => this.bufferData(data))

    this.server = createServer(c => {
      console.log(`[PID ${this.pid}] Connected to ${this.fd}`)
      c.on('end', this.kill.bind(this))
    }).
    listen(this.socket).
    on('connection', socket => {
      this.connected = true
      socket.write(this.bufferedData)
      this.onData(data => socket.write(data))
    })

    console.log(`[PID ${this.pid}] Created ${this.fd}. Connect via ${this.socket}`)
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

  get socket() {
    return `/tmp/beep-beep-${this.pid}.sock`
  }

  get sessionArgs() {
    return {
      name: 'xterm-256color',
      cwd: process.env.HOME,
      env: {
        // LANG: (api.app.getLocale() || '') + '.UTF-8',
        LANG: "en-US.UTF-8",
        TERM: 'xterm-256color',
        COLORTERM: 'truecolor',
        ...process.env
      }
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
        if (this.connected) {
          this.bufferedData = ''
        }
        this.bufferTimeout = null
      }, {wait: 7})()
    }
  }
}
