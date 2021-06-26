<p align="center">
  <a href="https://github.com/npezza93/beep-beep">
    <img src="./.github/logo.gif" width="550">
  </a>
</p>

# beep-beep

`beep-beep` maintains a pool of shells in the background so that when it's time to
create a new terminal session, one is already warmed up and ready to go.

## Installation

##### Currently only Macos is supported

```
brew install beep-beep
```

Binaries are available on the releases page of the repo. Download the tar file,
and place the executable in your path.

##### From source
```
git clone https://github.com/npezza93/beep-beep
cd beep-beep
npm i
./build
./dist/beep-beep
```

## Usage

`beep-beep` is split into two functions, the client and the server.

#### Server

The server maintains the pool of ptys and is run the background. Ideally as a
launtctl process.

`beep-beep server`

When using the `server` subcommand, no options are required but the available
options are as follows:
  - `-q, --queue <count>`
    - How many ptys should be queued up (default: 1)
  - `-s, --shell <file-path>`
    - File path to the shell to run (default: $SHELL)
  - `-a, --args <args>`
    - Arguments to passed to the shell (comma separated)
  - `-c, --config-file <file-path>`
    - Read options via specified json config file. Useful if `beep-beep` is
      running in a background process via Homebrew
  - `-w, --watch <absolute-paths>`
    - If any of the supplied files change, the enqueued ptys are restarted (comma separated)


#### Client

The client connects to the server, requests a pty, and connects to the next
available pty.

In your terminal emulator, change the command to run to be the path to
`beep-beep`, `bin/beep-beep`.

If you also use tmux, you can change your default-command to use `beep-beep`:

```
set -g default-command "bin/beep-beep"
```
