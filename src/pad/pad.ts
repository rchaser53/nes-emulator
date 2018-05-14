import { Handler } from '../handler';

export class Pad {
  handler: Handler
  constructor(handler: Handler) {
    this.handler = handler;
    this.addPadDown();
    this.addPadUp();
  }

  addPadDown() {
    document.addEventListener('keydown', (event) => {
      const currentValue = this.handler.readCPU(0x4016);
      switch (event.keyCode) {
        case 90:      // A button(z)
          this.handler.writeCPU(0x4016, currentValue | 0x0)
          break;
        case 88:      // B button(x)
          this.handler.writeCPU(0x4016, currentValue | 0x1)
          break;
        case 67:      // select(c)
          this.handler.writeCPU(0x4016, currentValue | 0x2)
          break;
        case 86:      // start(v)
          this.handler.writeCPU(0x4016, currentValue | 0x3)
          break;
        case 38:      // up
          this.handler.writeCPU(0x4016, currentValue | 0x4)
          break;
        case 40:      // down
          this.handler.writeCPU(0x4016, currentValue | 0x5)
          break;
        case 37:      // left
          this.handler.writeCPU(0x4016, currentValue | 0x6)
          break;
        case 39:      // right
          this.handler.writeCPU(0x4016, currentValue | 0x7)
          break;
      }
    });
  }

  addPadUp() {
    document.addEventListener('keyup', (event) => {
      const currentValue = this.handler.readCPU(0x4016);
      switch (event.keyCode) {
        case 90:      // A button(z)
          this.handler.writeCPU(0x4016, currentValue ^ 0x0)
          break;
        case 88:      // B button(x)
          this.handler.writeCPU(0x4016, currentValue ^ 0x1)
          break;
        case 67:      // select(c)
          this.handler.writeCPU(0x4016, currentValue ^ 0x2)
          break;
        case 86:      // start(v)
          this.handler.writeCPU(0x4016, currentValue ^ 0x3)
          break;
        case 38:      // up
          this.handler.writeCPU(0x4016, currentValue ^ 0x4)
          break;
        case 40:      // down
          this.handler.writeCPU(0x4016, currentValue ^ 0x5)
          break;
        case 37:      // left
          this.handler.writeCPU(0x4016, currentValue ^ 0x6)
          break;
        case 39:      // right
          this.handler.writeCPU(0x4016, currentValue ^ 0x7)
          break;
      }
    });
  }
}

// 1	A
// 2	B
// 3	SELECT
// 4	START
// 5	上
// 6	下
// 7	左
// 8	右