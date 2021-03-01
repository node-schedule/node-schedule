/* Range object */
export class Range {
  public start: number;
  public end: number;
  public step: number;

  constructor(start: number = 0, end: number = 60, step: number = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }

  contains(val: number): boolean {
    if (this.step === null || this.step === 1) {
      return (val >= this.start && val <= this.end);
    } else {
      for (let i = this.start; i < this.end; i += this.step) {
        if (i === val) {
          return true;
        }
      }

      return false;
    }
  }
}
