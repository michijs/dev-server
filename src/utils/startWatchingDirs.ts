import { config } from '../config/config';
import fs from 'fs';
import { build } from '../actions/build';

let watching = false;
function startWatchingDirs(onChangeCallback?: Function) {
  if (process.env.DISABLE_WATCH === 'false') {
    config.watchDir.forEach(dir => {
      fs.watch(dir, { recursive: true }, () => {
        if (watching) return;
        watching = true;
        build(onChangeCallback);
        setTimeout(() => {
          watching = false;
        }, 1000);
      });
    });
  }
}

export default startWatchingDirs;