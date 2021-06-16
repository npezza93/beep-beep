<p align="center">
  <a href="https://github.com/npezza93/beep-beep">
    <img src="./.github/logo.gif" width="550">
  </a>
</p>

# beep-beep
![Build Status](https://github.com/npezza93/beep-beep/workflows/tests/badge.svg)

beep-beep maintains a pool of shells in the background so that when it's time to
create a new terminal session, one is already warmed up and ready to go.

## API

beep-beep --command "bin/zsh" --queue 2 --watch ".zshrc"

Anytime a file that is being watched is changed all the unused shells are thrown
out and new ones are spawned.

In your tmux.conf:
```
set -g default-command "reattach-to-user-namespace bin/beep-beep"
```

In your terminal settings change the command to run to `bin/beep-beep`
