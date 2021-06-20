#!/usr/bin/env node

import Pty from './pty.js'

const [,, ...args] = process.argv;

const pty = new Pty(args[0], args[1]);

function kill() {
  console.log("\nShutting down beep-beep\n");
  pty.kill();
  process.exit(0);
}

process.on('SIGINT', kill);

// export default profileManager => {
//   const ptys = {}

//   const kill = id => {
//     if (ptys[id]) {
//       ptys[id].kill()
//       delete ptys[id]
//     }
//   }

//   const create = () => {
//     return new Promise(resolve => {
//       const pty = new Pty(profileManager)
//       pty.onExit(() => kill(pty.id))
//       ipc.once(`pty-kill-${pty.id}`, () => kill(pty.id))

//       resolve(pty)
//     })
//   }

//   let preppedPty = create()

//   const disposeOfCreate = ipc.answerRenderer('pty-create', async ({sessionId, sessionWindowId}) => {
//     const pty = await preppedPty
//     ptys[pty.id] = pty
//     pty.created(sessionId, sessionWindowId)
//     preppedPty = create()

//     return pty.id
//   })

//   app.on('before-quit', () => {
//     disposeOfCreate()
//     Object.keys(ptys).forEach(kill)
//   })
// }
