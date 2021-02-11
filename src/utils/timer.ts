export default class Timer {
    start;

    startTimer() {
      this.start = Date.now();
    }

    endTimer() {
      return Date.now() - this.start;
    }
}