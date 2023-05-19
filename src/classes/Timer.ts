export class Timer {
  start: number;

  startTimer() {
    this.start = Date.now();
  }

  endTimer() {
    return Date.now() - this.start;
  }
}
