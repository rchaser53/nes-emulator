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
      let value = 0b0;
      switch (event.keyCode) {
        case 90:      // A button(z)
        value = (currentValue | 0b00000001)
          break;
        case 88:      // B button(x)
        value = (currentValue | 0b00000010)
          break;
        case 67:      // select(c)
        value = (currentValue | 0b00000100)
          break;
        case 86:      // start(v)
        value = (currentValue | 0b00001000)
          break;
        case 38:      // up
        value = (currentValue | 0b00010000)
          break;
        case 40:      // down
        value = (currentValue | 0b00100000)
          break;
        case 37:      // left
        value = (currentValue | 0b01000000)
          break;
        case 39:      // right
        value = (currentValue | 0b10000000)
          break;
      }
      this.handler.writeCPU(0x4016, value)
    });
  }

  addPadUp() {
    document.addEventListener('keyup', (event) => {
      const currentValue = this.handler.readCPU(0x4016);
      let value = 0b0;
      switch (event.keyCode) {
        case 90:      // A button(z)
        value = (currentValue ^ 0b00000001)
          break;
        case 88:      // B button(x)
        value = (currentValue ^ 0b00000010)
          break;
        case 67:      // select(c)
        value = (currentValue ^ 0b00000100)
          break;
        case 86:      // start(v)
        value = (currentValue ^ 0b00001000)
          break;
        case 38:      // up
        value = (currentValue ^ 0b00010000)
          break;
        case 40:      // down
        value = (currentValue ^ 0b00100000)
          break;
        case 37:      // left
        value = (currentValue ^ 0b01000000)
          break;
        case 39:      // right
        value = (currentValue ^ 0b10000000)
          break;
      }
      this.handler.writeCPU(0x4016, value)
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