import coloredString from './utils/coloredString';
import * as yargs from 'yargs';
import Timer from './utils/timer';


export async function cli() {
  const timer = new Timer();

  const showReadyMessage = () => console.log(`
  ${coloredString(`Ready in ${timer.endTimer()}ms.`)}`);
  timer.startTimer();

  const args = yargs
    .option('start', {
      type: 'boolean',
      default: false
    })
    .option('build', {
      type: 'boolean',
      default: false
    })
    .option('dist', {
      type: 'boolean',
      default: false
    })
    .option('env', {
      type: 'string'
    })
    .help()
    .alias('help', 'h')
    .argv;

  process.env.NODE_ENV = args.env || (args.build ? 'PRODUCTION' : args.dist ? 'DISTRIBUTION' : 'DEVELOPMENT');

  console.log(coloredString(`  Running in ${process.env.NODE_ENV} mode`));

  if (args.start) {
    const action = await import('./actions/start');
    action.start(showReadyMessage);
  }
  if (args.build) {
    const action = await import('./actions/build');
    action.build(showReadyMessage);
  }
  if (args.dist) {
    const action = await import('./actions/dist');
    action.dist(showReadyMessage);
  }
}