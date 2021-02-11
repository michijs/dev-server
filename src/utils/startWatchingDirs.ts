import { config } from '../config/config';
import fs from 'fs';
import { build } from '../actions/build';

let watching = false;
function startWatchingDirs(onChangeCallback?: Function) {
  try {
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
  } catch (e) {
    if (e.code == 'ERR_FEATURE_UNAVAILABLE_ON_PLATFORM') {
      console.log('  Watching dirs is not supported in this operating system');
    } else {
      throw e;
    }
  }
}

export default startWatchingDirs;